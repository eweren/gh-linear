# linhub

## Install

```bash
$ npm install --global linhub
```


## CLI

```
$ lh --help

  Usage
    $ linhub // or
    $ lh
```

Options

  -t, --ticket string          Directly start working on a ticket (ex lh -t SPR-12)
  -s, --search string          Search for tickets
  --add-reviewer string[]      Add reviewers - adds them as default if only flag
  --remove-reviewer string[]   Remove reviewers - adds them from default if only flag
  -m, --my                     Show only my tickets
  -r, --ready                  Mark related PR as ready for review
  -c, --code-review            Start codereview by assigning default reviewers or passed ones
  -h, --help                   Prints this usage guide

Copyright: THE ARC GmbH
