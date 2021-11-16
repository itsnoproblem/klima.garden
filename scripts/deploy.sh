#!/bin/bash

docker run --rm -it \
  -v ~/.aws:/root/.aws \
  -v ~/dev/projects/www.klima.garden/build:/root/build \
  amazon/aws-cli s3 sync --delete /root/build/ s3://klima.garden/

aws cloudfront create-invalidation --distribution-id E2CG7FXEJNFLH6 --paths "/*"
