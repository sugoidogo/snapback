#!/usr/bin/env python3

import logging
import logging.handlers

log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)

handler = logging.handlers.SysLogHandler(address = '/dev/log')

log.addHandler(handler)

class StreamToLogger(object):
    """
    Fake file-like stream object that redirects writes to a logger instance.
    """
    def __init__(self, logger, level):
       self.logger = logger
       self.level = level
       self.linebuf = ''

    def write(self, buf):
       for line in buf.rstrip().splitlines():
          self.logger.log(self.level, line.rstrip())

    def flush(self):
        pass

sys.stdout=StreamToLogger(log,logging.INFO)
sys.stderr=StreamToLogger(log,logging.ERROR)

from tomllib import load
from sys import argv
from subprocess import check_call
from datetime import datetime

with open('/etc/snapback/config.toml','rb') as file:
    config=load(file)

event=argv[1]

if event == 'create-snapshot-post':
    subvolume=argv[2]
    fstype=argv[3]
    number=argv[4]
    destination=datetime.now().strftime(config[subvolume])
    check_call(['tar',
        f'--directory={subvolume}/.snapshots/{number}/snapshot',
        '--create','--file',destination,
        '--auto-compress','--dereference','.'
    ],stdout=sys.stdout,stderr=sys.stdout)