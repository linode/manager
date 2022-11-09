import subprocess
import re
import sys
import datetime

RELEASE='v' + sys.argv[1].strip('v')
ORIGIN=sys.argv[2]
try:
    REPO=sys.argv[3]
except Exception:
    REPO=False

DATE = datetime.datetime.now().strftime('%Y-%m-%d')
START_INSERT=0 if (REPO and REPO.lower() != 'manager') else 5

NOT_INCLUDED_IN_LOG = []

TEST_KEYWORDS = ['test', 'script', 'storybook', 'e2e', '[TEST]']
BREAKING_KEYWORDS = ['break', 'deprecate']
CHANGED_KEYWORDS = ['update', 'change', '[PERF]', '[CHANGED]']
FIXED_KEYWORDS = ['fix', 'repair', 'bug', '[FIXED]', '[DOCS]', '[REFACTOR]', '[BUILD]']

def incrementLine():
    global START_INSERT
    START_INSERT+=1
    return START_INSERT

def generateJQLQuery(ticket_list):
    last_ticket=len(ticket_list) - 1
    jql_query='key in('
    for i,ticket in enumerate(ticket_list):
        clean_ticket=ticket.strip().replace(':','')
        if( i == last_ticket ):
            jql_query+=clean_ticket+')'
        else:
            jql_query+=clean_ticket+','
    print('~~~~~~~~NOT INCLUDED IN CHANGELOG~~~~~~~')
    for i,commit in enumerate(NOT_INCLUDED_IN_LOG):
        print(commit)
    print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    print('~~~~~~~~TICKETS IN RELEASE~~~~~~~~')
    print(jql_query.replace(' ','-'))
    print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

def checkKeyWords(list_keywords, commit):
    for word in list_keywords:
        if(word in commit):
            return True
    return False

# Given a commit message from a merged Pull Request, remove the PR ID.
# Example: "My first commit (#1)" -> "My first commit"
def remove_pull_request_id(commit_message):
    regexp = "\(#\d+\)"
    return re.sub(regexp, '', commit_message).strip()

def generateChangeLog(release, date, origin, repo=''):
    git_log_command = ["git", "log", "--no-merges", "--oneline", "--pretty='%s'", "{}/develop...HEAD".format(origin)]

    if (repo):
        git_log_command.extend(["--", "packages/{}".format(repo)])

    commits = subprocess.check_output(git_log_command, subprocess.STDOUT).decode('utf-8').split('\n')

    # Strip the first and last characters of each line, which are single quotes.
    commits = [c[1:-1] for c in commits]

    breaking=[]
    added=[]
    changed=[]
    fixed=[]
    jql_query=[]

    for commit in commits:
        commit = remove_pull_request_id(commit)

        jira_key_regex=re.match('M3-\d{4}: ', commit)
        if (jira_key_regex is not None):
            jira_key=jira_key_regex.group(0)
            jql_query.append(jira_key)
            commit = commit.lstrip(jira_key)

        if(checkKeyWords(TEST_KEYWORDS, commit.lower())):
            NOT_INCLUDED_IN_LOG.append(commit)
            continue

        if(checkKeyWords(BREAKING_KEYWORDS, commit.lower())):
            breaking.append(commit)
            continue

        if(checkKeyWords(CHANGED_KEYWORDS, commit.lower())):
            changed.append(commit)
            continue

        if(checkKeyWords(FIXED_KEYWORDS, commit.lower())):
            fixed.append(commit)
            continue

        added.append(commit)


    generateJQLQuery(jql_query)

    changelog_file = "CHANGELOG.md"

    # If the repo isn't explicitly passed in, we default to Manager's CHANGELOG.
    if (repo == 'manager' or repo == '' or repo is False):
        changelog_file = "CHANGELOG.md"
    else:
        changelog_file = "packages/{}/CHANGELOG.md".format(repo)

    read_change_log=open(changelog_file, 'r')
    change_log_lines=read_change_log.readlines()
    read_change_log.close()

    change_log_lines.insert(START_INSERT,'\n')
    change_log_lines.insert(incrementLine(),'## [%s] - %s\n'%(date, release))
    change_log_lines.insert(incrementLine(),'\n')

    if( breaking ):
        change_log_lines.insert(incrementLine(),'### Breaking:\n')
        for commit in breaking:
            change_log_lines.insert(incrementLine(),'- %s\n'%(commit))
        change_log_lines.insert(incrementLine(),'\n')

    if( added ):
        change_log_lines.insert(incrementLine(),'### Added:\n')
        for commit in added:
            change_log_lines.insert(incrementLine(),'- %s\n'%(commit))
        change_log_lines.insert(incrementLine(),'\n')

    if( changed ):
        change_log_lines.insert(incrementLine(),'### Changed:\n')
        for commit in changed:
            change_log_lines.insert(incrementLine(),'- %s\n'%(commit))
        change_log_lines.insert(incrementLine(),'\n')

    if( fixed ):
        change_log_lines.insert(incrementLine(),'### Fixed:\n')
        for commit in fixed:
            change_log_lines.insert(incrementLine(),'- %s\n'%(commit))
        change_log_lines.insert(incrementLine(),'\n')

    write_change_log=open(changelog_file, 'w')
    write_change_log.writelines(change_log_lines)

generateChangeLog(RELEASE, DATE, ORIGIN, REPO)
