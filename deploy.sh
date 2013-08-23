#!/bin/bash -xe

root_dir="`dirname \"$0\"`"
cd "$root_dir/yella"
grunt build --force  # todo: remove --force
cd -

mkdir -p "$root_dir/api/static" "$root_dir/api/app/templates"
rsync -avz --delete "$root_dir/yella/dist/scripts" "$root_dir/yella/dist/styles" "$root_dir/api/static/"
cp "$root_dir/yella/dist/favicon.ico" "$root_dir/api/static/"
cp "$root_dir/yella/dist/"*.html "$root_dir/api/app/templates"

cd "$root_dir"
python "$GAE_PATH/appcfg.py" --oauth2 --no_cookies update api/
cd -