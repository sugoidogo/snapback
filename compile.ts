import { spawnSync } from "node:child_process"

function sugoiSpawn(...command: string[]) {
    const result = spawnSync(command.shift()!, command, { stdio: 'inherit' })
    if (result.error) throw result.error
    if (result.status !== 0) process.exit(result.status)
    return result
}

const targets = [
    'x86_64-unknown-linux-gnu',
    'aarch64-unknown-linux-gnu',
]

for (const target of targets) {
    sugoiSpawn('deno', 'compile',
        '--target', target,
        '--include', 'src/snapper-template.txt',
        '--include', 'src/snapper@.service',
        '--output', 'dist/snapback-'+target,
        'src/main.ts'
    )
}