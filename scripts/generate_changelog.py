import subprocess
import re
import sys

RELEASE=sys.argv[1]
DATE=sys.argv[2]
ORIGIN=sys.argv[3]

START_INSERT=5

NOT_INCLUDED_IN_LOG = []

TEST_KEYWORDS = ['test', 'script', 'storybook', 'e2e']
BREAKING_KEYWORDS = ['break', 'deprecate']
CHANGED_KEYWORDS = ['update', 'change']
FIXED_KEYWORDS = ['fix', 'repair', 'bug']

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

def generateChangeLog(release, date, origin):
    git_log_command = ["git", "log", "--no-merges", "--oneline", "--pretty='%s'", "{}/master...HEAD".format(origin)]

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

        jira_key_regex=re.match('M3-\d{4}', commit)
        if (jira_key_regex is not None):
            jira_key=jira_key_regex.group(0)
            jql_query.append(jira_key)
            commit.lstrip(jira_key)

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

    read_change_log=open('CHANGELOG.md', 'r')
    change_log_lines=read_change_log.readlines()
    read_change_log.close()

    change_log_lines.insert(START_INSERT,'\n')
    change_log_lines.insert(incrementLine(),'## [%s] - %s\n'%(release,date))
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

    write_change_log=open('CHANGELOG.md', 'w')
    write_change_log.writelines(change_log_lines)

generateChangeLog(RELEASE, DATE, ORIGIN)
