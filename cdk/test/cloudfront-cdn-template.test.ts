import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { CdkStack } from '../lib/cdk-stack.js';

import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { beforeAll, test } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const functionDir = path.resolve(here, '../function');
const functionJs = path.join(functionDir, 'index.js');
const websiteAssetDir = path.resolve(here, '../../app/.output/public');

// CloudFront FunctionCode.fromFile は synth 時に実ファイルを読み込むため、
// 成果物が存在しないクリーンなチェックアウトでもテストが動作するよう
// function のビルドのみ行う（app の vinxi build は対象外）。
// BucketDeployment の asset ディレクトリも同様に、存在しなければ
// 空ディレクトリを用意して synth 可能にする。
beforeAll(() => {
  if (!fs.existsSync(functionJs)) {
    childProcess.execSync('pnpm build', {
      cwd: functionDir,
      stdio: 'inherit',
    });
  }
  if (!fs.existsSync(websiteAssetDir)) {
    fs.mkdirSync(websiteAssetDir, { recursive: true });
  }
});

test('CloudFront Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkStack(app, 'MyTestStackTest', {
    bucketName: 'test',
    cloudfront: {
      comment: '',
      originAccessControl: {
        functionConfig: {
          name: 'test',
        },
        name: 'test',
      },
    },
  });
  // THEN
  const template = Template.fromStack(stack);

  // console.log(JSON.stringify(template, null, 2));

  template.hasResourceProperties('AWS::S3::Bucket', {
    AccessControl: 'Private',
    BucketEncryption: {
      ServerSideEncryptionConfiguration: [
        {
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256',
          },
        },
      ],
    },
    BucketName: 'test',
    Tags: Match.arrayWith([
      {
        Key: 'aws-cdk:auto-delete-objects',
        Value: 'true',
      },
    ]),
  });

  template.hasResourceProperties('AWS::CloudFront::Function', {
    FunctionConfig: {
      Runtime: 'cloudfront-js-2.0',
    },
    Name: 'test',
  });

  template.hasResourceProperties('AWS::CloudFront::OriginAccessControl', {
    OriginAccessControlConfig: {
      Name: 'test',
      OriginAccessControlOriginType: 's3',
      SigningBehavior: 'no-override',
      SigningProtocol: 'sigv4',
    },
  });

  template.hasResourceProperties('AWS::CloudFront::Distribution', {
    DistributionConfig: Match.objectLike({
      Comment: '',
      DefaultCacheBehavior: {
        AllowedMethods: ['GET', 'HEAD'],
        CachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6',
        CachedMethods: ['GET', 'HEAD'],
        Compress: true,
        FunctionAssociations: [
          {
            EventType: 'viewer-request',
            FunctionARN: Match.anyValue(),
          },
        ],
        TargetOriginId: Match.anyValue(),
        ViewerProtocolPolicy: 'redirect-to-https',
      },
      Enabled: true,
      HttpVersion: 'http2and3',
      IPV6Enabled: true,
      Origins: Match.arrayWith([
        Match.objectLike({
          DomainName: Match.anyValue(),
          OriginAccessControlId: Match.anyValue(),
        }),
      ]),
    }),
  });
});
