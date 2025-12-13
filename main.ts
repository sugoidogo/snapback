#!/usr/bin/env node

import { program } from "commander"
import { parseJSON, parseTOML, stringifyJSON } from "confbox"
import fs from "node:fs"
import strftime from 'strftime'
import { spawnSync } from "node:child_process"

let config: { [key: string]: string } = {}
let index: { [key: string]: { [key: string]: string } } = {}

function sugoiSpawn(...command: string[]) {
    const result = spawnSync(command.shift()!, command, { stdio: 'inherit' })
    if (result.error) throw result.error
    if (result.status !== 0) process.exit(result.status)
    return result
}

program.name('snapback')
    .description('snapper plugin for making tar backups of snapshots for offsite storage')
    .option('-c, --config-file', 'path to snapback config file', '/etc/snapback/config.toml')
    .option('-i, --index-file', 'path to snapback index file', '/etc/snapback/index.json')
    .hook('preAction', function (program) {
        const config_file = program.opts().configFile
        if (fs.existsSync(config_file)) config = parseTOML(fs.readFileSync(config_file,'utf8'))
        if (Object.keys(config).length === 0) {
            console.warn('no subvolumes configured for snapback, exiting')
            process.exit()
        }
        const index_file = program.opts().indexFile
        if (fs.existsSync(index_file)) index = parseJSON(fs.readFileSync(index_file,'utf8'))
    })

program.command('create-snapshot-post <subvolume> <fstype> <number>')
    .action(function (subvolume, fstype, number) {
        if (!config[subvolume]) return
        const destination = strftime(config[subvolume])
        sugoiSpawn('tar',
            `--directory=${subvolume}/.snapshots/${number}/snapshot`,
            '--create', '--file', destination,
            '--auto-compress', '--dereference', '.'
        )
        index[subvolume][number] = destination
    })

program.command('delete-snapshot-post <subvolume> <fstype> <number>')
    .action(function (subvolume, fstype, number) {
        const destination = index[subvolume][number]
        fs.unlinkSync(destination)
        delete index[subvolume][number]
    })

program.command('delete-config-post <subvolume> <fstype>')
    .action(function (subvolume, fstype) {
        delete index[subvolume]
    })

program.parse()

if (Object.keys(index).length) fs.writeFileSync(program.opts().indexFile,stringifyJSON(index), 'utf8')