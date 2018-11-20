import subprocess
import re
import sys

START_INSERT=5

def incrementLine():
    global START_INSERT
    START_INSERT+=1
    return START_INSERT


release=sys.argv[1]
date=sys.argv[2]

git_diff=subprocess.Popen(['git', 'log', '--no-merges', '--oneline', "--pretty=split:'%s'", 'upstream/master...HEAD'],
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

    if( 'test' in commit.lower()):
        commit_array.pop(i)
        break

    if( 'breaking' in commit.lower()):
        breaking.append(commit_array[i])
        break

    if( 'changed' in commit.lower()):
        changed.append(commit_array[i])
        break

    if( 'fixed' in commit.lower()):
        fixed.append(commit_array[i])
        break

    added.append(commit_array[i])

read_change_log=open('CHANGELOG.md', 'r')
change_log_lines=read_change_log.readlines()
read_change_log.close()

change_log_lines.insert(START_INSERT,'\n')
change_log_lines.insert(incrementLine(),'## [%s] - %s\n'%(release,date))
change_log_lines.insert(incrementLine(),'\n')

if( breaking ):
    change_log_lines.insert(incrementLine(),'###Breaking:\n')
    for commit in breaking:
        change_log_lines.insert(incrementLine(),'-%s\n'%(commit))
    change_log_lines.insert(incrementLine(),'\n')

if( added ):
    change_log_lines.insert(incrementLine(),'###Added:\n')
    for commit in added:
        change_log_lines.insert(incrementLine(),'-%s\n'%(commit))
    change_log_lines.insert(incrementLine(),'\n')

if( changed ):
    change_log_lines.insert(incrementLine(),'###Changed:\n')
    for commit in changed:
        change_log_lines.insert(incrementLine(),'-%s\n'%(commit))
    change_log_lines.insert(incrementLine(),'\n')

if( fixed ):
    change_log_lines.insert(incrementLine(),'###Fixed:\n')
    for commit in fixed:
        change_log_lines.insert(incrementLine(),'-%s\n'%(commit))
    change_log_lines.insert(incrementLine(),'\n')

write_change_log=open('CHANGELOG_TEMP.md', 'w')
write_change_log.writelines(change_log_lines)
write_change_log.close()
