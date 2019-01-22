#!/bin/bash
sleep 1m
yarn e2e:wait-for-manger-local
yarn e2e --log --spec=e2e/specs/account/billing.spec.js
