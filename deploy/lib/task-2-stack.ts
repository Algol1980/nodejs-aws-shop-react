import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {Bucket} from "aws-cdk-lib/aws-s3";
import {CloudFrontWebDistribution} from "aws-cdk-lib/aws-cloudfront";
import { aws_cloudfront, aws_cloudfront_origins, aws_s3 } from "aws-cdk-lib";

// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class Task2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: { env: { region: any; account: any } }) {
    super(scope, id, props);

    const s3Bucket = new cdk.aws_s3.Bucket(this, 'algolius-bookstore', {
      bucketName: 'algolius-bookstore',
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      encryption: cdk.aws_s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      websiteIndexDocument: 'index.html',
      cors: [
        {
          allowedMethods: [
            cdk.aws_s3.HttpMethods.GET,
            cdk.aws_s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });
    // const logBucket = new aws_s3.Bucket(this, 'log-bucket', {
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    //   autoDeleteObjects: true,
    // })
    const oai = new aws_cloudfront.OriginAccessIdentity(this, 'OAI');
    s3Bucket.grantRead(oai);
    const distribution = new aws_cloudfront.CloudFrontWebDistribution(
      this,
      'algolius-bookstore-distribution', {
        defaultRootObject: 'index.html',
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: s3Bucket,
              originAccessIdentity: oai,
            },
            behaviors: [{isDefaultBehavior: true}, { pathPattern: '/*', allowedMethods: aws_cloudfront.CloudFrontAllowedMethods.GET_HEAD }],
          },
        ],
      });

    const deployment = new cdk.aws_s3_deployment.BucketDeployment(this, 'Task2Deployment', {
      sources: [cdk.aws_s3_deployment.Source.asset('../dist')],
      destinationBucket: s3Bucket,
      distribution: distribution,
      distributionPaths: ['/*'],
    });
    deployment.node.addDependency(distribution);

    new cdk.CfnOutput(this, 'CloudFrontURL', {
      value: distribution.distributionDomainName,
      description: 'The CloudFront distribution URL',
    });

  }
}
