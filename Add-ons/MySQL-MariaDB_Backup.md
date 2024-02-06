# Automaticly create database backup on daily base

```shell
mkdir /var/scripts
mkdir /backups
vi /var/scripts/mysqlbackups
```
Now past the follwoing :
```text
#!/bin/bash
backup_path=/backups
expiry_date=60
current_date=$(date +%Y-%m-%d)

# create folder if it does not exist
if [ ! -d "$backup_path" ]; then
        mkdir "$backup_path"
fi

if [ ! -d "$backup_path/$current_date" ]; then
    mkdir -p "$backup_path/$current_date"
    if [ ! -f $backup_path/$current_date/db-$(date +%H%M).sql ]; then
            mysqldump --all-databases | gzip -c > $backup_path/$current_date/db-$(date +%H%M).sql.gz
    fi
else
    if [ ! -f $backup_path/$current_date/db-$(date +%H%M).sql ]; then
            mysqldump --all-databases | gzip -c > $backup_path/$current_date/db-$(date +%H%M).sql.gz
    fi
fi
# delete backup older than x day
find $backup_path -type d -mtime +$expiry_date | xargs rm -Rf
```
to save type ":wq!"   <-- no quotes  

```shell
chmod +x /var/scripts/mysqlbackups
crontab -e
```
Choose your prefert editor or use VIM  
At the bottom add the following line:
```text
30 2 * * * /var/scripts/mysqlbackups
```

The automate of MySql / MariaDB has been setup and will create an backup on daily basis

