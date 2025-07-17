#!/bin/bash

npm test --passWithNoTests 2>&1 | grep 'FAIL' | awk '{print $2}' | sort | uniq