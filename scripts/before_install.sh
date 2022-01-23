#!/bin/bash -ev

if [ -d /srv/hk01-member-system-frontend ]; then
  rm -rf /srv/hk01-member-system-frontend
fi

mkdir -vp /srv/hk01-member-system-frontend
