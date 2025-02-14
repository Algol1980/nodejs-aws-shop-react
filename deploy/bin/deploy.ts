#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import {Task2Stack} from '../lib/task-2-stack';

const app = new cdk.App();
new Task2Stack(app, 'Task2Stack', {
  env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
});
