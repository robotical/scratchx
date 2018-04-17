## ScratchX
#### Website for experimental Scratch extensions

Note: Scratch 2.0 and ScratchX are now in maintenance mode while the team focuses efforts on [Scratch 3.0](https://scratch.mit.edu/developers). While critical issues will be addressed please note that any feature requests or minor issues will not be reviewed until the next major release.

You can run a simple web server on your computer to get access to the ScratchX Interface by running the `serve.py` Python script.


## Building a stand-alone application

To do this you need to install some extra stuff. start with a python virtualenv if you don't want to install
these libraries system-wide:

```
  # Make an environment:
$ python3 -m venv ./env
  # On OSX or Linux:
$ source ./env/bin/activate
  # Or on Windows: 
$ source .\VENV\bin\activate
```

Then install some dependencies

```
(env) $ pip install -r dev-pip-requirements.txt
...
```

To build a standalone binary that contains everything needed to run ScratchX:

```
(env) $ pyinstaller ./serve.spec
```

Your new binary will be in the `/dist` folder.

