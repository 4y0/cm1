## Command Memorizer [V1]
cm1 is a simple CLI tool for managing frequently run commands. It can be used to memorize chain of CLI commands, create short key aliases for easy recall and run processes at a later time.

Cm1 also provides a simple web GUI for managing commands [https://cm1cs.herokuapp.com/](https://cm1cs.herokuapp.com/) .. This is particularly useful if you use / run same commands on different devices or if you are changing devices altogether. You can manage these commands from the web gui, pull them into your local device using the token generated from the GUI.

### Installation
```
npm install -g cm1
```


### Memorize a command
```
cm1 --add "git add --all && git commit -am {optional_placeholder}" basic-commit
```
Memorize the chained commands "git add --all && git commit -am {optional_placeholder}" and index with the key `basic-commit`



### Recall and run memorized command
```
cm1 basic-commit "Init cm1 repository"
```
Run the command[s] indexed with `basic-commit` passing "Init cm1 repository" as a replacement for any placeholders in the indexed command:
`git add --all && git commit -am "Init cm1 repository"`



### Recall command but don't run
```
cm1 basic-commit "Init cm1 repository" --noexec
```
Just echo command on the CLI:
`git add --all && git commit -am "Init cm1 repository"`



### List memorized commands
```
cm1 --list
```
Key:  gc  Command:  git commit -am {message} && git push origin {branch}  To run: cm1  gc
Key:  gr  Command:  sudo rm -fr .git  To run: cm1  gr



### Rename command key
```
cm1 -r basic-commit bc
```
Running `cm1 bc "some commit message"` will now do `git add --all && git commit -am "some commit message"`


### Modify command
```
cm1 -m bc "git add --all && git commit -am {commitmessage} && git push origin {branchname}"
```


### Remove a memorized command
```
cm1 --clear bc
```


### Clear all memorized commands
```
cm1 --clear
```


### Set cm1 token
```
cm1 --init tokenvalue [-d]
```
Token can be gotten from [https://cm1cs.herokuapp.com/](https://cm1cs.herokuapp.com/). If the -d flag is passed, tokenvalue will also be set as the default token to use with cm1.




### Set cm1 token as default
```
cm1 --default tokenvalue
```



### Push locally stored commands to cloud storage
```
cm1 --push
```




### Pull commands stored in cloud storage to local storage
```
cm1 --pull [-f]
```
If -f flag is passed, pulled commands will overwrite existing commands in local storage else, a merge is made.






