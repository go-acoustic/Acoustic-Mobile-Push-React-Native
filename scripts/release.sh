#!/usr/local/bin/bash
shopt -s extglob
set -e

PUBLIC_REPO_URL=$1
VERSION=$2

rm -rf .git release
git clone $PUBLIC_REPO_URL release
cd release

rm -rf *
cp -r ../Documentation .
cp -r ../plugins .
cp -r ../SampleApp .
cp ../.gitignore .
cp ../license.txt .

git add .
git commit -m "$VERSION"
git tag "$VERSION"
git push
git push --tags
