# Snapback

A snapper add-on for making tar backups of snapper snapshots.
Download from [releases](https://github.com/sugoidogo/snapback/releases/latest)

My use case is to create large tar backups to send to cloud storage while program data is at rest, without delaying the startup of the service or the shutdown of the system. Snapshots are made right before the service starts, and archives are generated in the background from the snapshots.

## Installing

### Automatically

snapback now includes an install command, so you can simply run `sudo ./snapback install` and be done.

### Manually

Depending on your distro, snapback may need to go in `/usr/lib/snapper/plugins` or `/usr/libexec/snapper/plugins`. After moving [`snapper-template.txt`](src/snapper-template.txt) to `/etc/snapper/config-templates/snapback`, installing/enabling [`snapper@.service`](src/snapper@.service) creates a snapper config from that template for whatever directory is given as the instance name if it doesn't already exist, and creates a snapshot before the service starts.

## Config

By creating the following file:
```
# /etc/systemd/system/data-generating.service.d/snapback.conf
# systemd unit names must have slashes replaced with dashes,
# so -subvolume-dir represents /subvolume/dir in the unit names below
[Unit]
Wants=snapper@-subvolume-dir.service
After=snapper@-subvolume-dir.service
```
a snapshot is triggered before the service starts.

With the following config:
```toml
# /etc/snapback/config.toml
"/subvolume/dir"="/backup/%F_%H-%M-%S.tar.gz"
```
you can enable creating tar archives using strftime formatting. The tar command uses `--auto-compress`, so the type of compression used in the archive depends on the file name you provide.

Retention is controlled entirely by snapper.
When snapper deletes a snapshot, snapback deletes the backup.
When the snapper config is deleted (via snapper command) snapback only removes the backup metadata stored locally,
not the backups themselves.