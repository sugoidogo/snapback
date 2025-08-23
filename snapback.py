#!/usr/bin/env python3

import logging
import logging.handlers

log = logging.getLogger(__name__)
log.setLevel(logging.DEBUG)

log.addHandler(logging.handlers.SysLogHandler(address='/dev/log'))
log.addHandler(logging.FileHandler('/etc/snapback/log.txt', mode='w'))

try:
    from tomllib import load
    from sys import argv
    from subprocess import check_call
    from datetime import datetime

    with open('/etc/snapback/config.toml', 'rb') as file:
        config = load(file)

    event = argv[1]

    if event == 'create-snapshot-post':
        subvolume = argv[2]
        fstype = argv[3]
        number = argv[4]
        destination = datetime.now().strftime(config[subvolume])
        check_call(['tar',
                    f'--directory={subvolume}/.snapshots/{number}/snapshot',
                    '--create', '--file', destination,
                    '--auto-compress', '--dereference', '.'
                    ])

except Exception as e:
    import traceback
    log.error(traceback.format_exc())
    raise e
