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

def generateChangeLog(release, date, origin):
    git_diff=subprocess.Popen(['git', 'log', '--no-merges', '--oneline', "--pretty=split:'%s'", origin+'/master...HEAD'],
               stdout=subprocess.PIPE,
               stderr=subprocess.STDOUT)
    stdout,stderr = git_diff.communicate()
    clean_sdout = str(stdout).replace('b\"', '').replace('\n', '').replace('\\n','').replace("'", '').replace('\"','')
    commit_array=clean_sdout.split('split:')
    commit_array.pop(0)

    breaking=[]
    added=[]
    changed=[]
    fixed=[]
    jql_query=[]

    for i,commit in enumerate(commit_array):
        jira_key_regex=re.match('(''|\s)M3(-|\s)\d{1,5}(-|\s|:)', commit)
        if( not (jira_key_regex is None) ):
            jira_key=jira_key_regex.group(0)
            jql_query.append(jira_key)
            commit_array[i]=commit.lstrip(jira_key)

        if(checkKeyWords(TEST_KEYWORDS, commit.lower())):
            NOT_INCLUDED_IN_LOG.append(commit_array[i])
            continue

        if(checkKeyWords(BREAKING_KEYWORDS, commit.lower())):
            breaking.append(commit_array[i])
            continue

        if(checkKeyWords(CHANGED_KEYWORDS, commit.lower())):
            changed.append(commit_array[i])
            continue

        if(checkKeyWords(FIXED_KEYWORDS, commit.lower())):
            fixed.append(commit_array[i])
            continue

        added.append(commit_array[i])


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
