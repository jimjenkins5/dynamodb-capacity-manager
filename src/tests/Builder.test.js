'use strict';

var _ = require('underscore'),
    expect = require('expect.js'),
    Builder = require('../Builder'),
    DCM = require('../index');

describe('Builder', function() {

   var builder,
       tbl1R = { resourceType: 'table', name: 'Tbl1', tableName: 'Tbl1', capacityType: 'ReadCapacityUnits' },
       tbl1W = { resourceType: 'table', name: 'Tbl1', tableName: 'Tbl1', capacityType: 'WriteCapacityUnits' },
       tbl1idR = { resourceType: 'index', name: 'Tbl1::_id', tableName: 'Tbl1', indexName: '_id', capacityType: 'ReadCapacityUnits' },
       tbl1idW = { resourceType: 'index', name: 'Tbl1::_id', tableName: 'Tbl1', indexName: '_id', capacityType: 'WriteCapacityUnits' },
       tbl2R = { resourceType: 'table', name: 'Tbl2', tableName: 'Tbl2', capacityType: 'ReadCapacityUnits' },
       tbl2W = { resourceType: 'table', name: 'Tbl2', tableName: 'Tbl2', capacityType: 'WriteCapacityUnits' },
       tbl2idR = { resourceType: 'index', name: 'Tbl2::_id', tableName: 'Tbl2', indexName: '_id', capacityType: 'ReadCapacityUnits' },
       tbl2idW = { resourceType: 'index', name: 'Tbl2::_id', tableName: 'Tbl2', indexName: '_id', capacityType: 'WriteCapacityUnits' };

   beforeEach(function() {
      builder = new Builder();
   });

   describe('resource exclusion', function() {

      it('excludes a particular resource by name - tables', function() {
         builder.excludeTable(tbl1R.tableName);
         expect(builder.isExcludedResource(tbl1R)).to.be(true);
         expect(builder.isExcludedResource(tbl1W)).to.be(true);
         expect(builder.isExcludedResource(tbl1idR)).to.be(false);
         expect(builder.isExcludedResource(tbl1idW)).to.be(false);
         expect(builder.isExcludedResource(tbl2R)).to.be(false);
         expect(builder.isExcludedResource(tbl2W)).to.be(false);
         expect(builder.isExcludedResource(tbl2idR)).to.be(false);
         expect(builder.isExcludedResource(tbl2idW)).to.be(false);
      });

      it('excludes a particular resource by name - indexes', function() {
         builder.excludeIndex(tbl1idR.tableName, tbl1idR.indexName);
         expect(builder.isExcludedResource(tbl1R)).to.be(false);
         expect(builder.isExcludedResource(tbl1W)).to.be(false);
         expect(builder.isExcludedResource(tbl1idR)).to.be(true);
         expect(builder.isExcludedResource(tbl1idW)).to.be(true);
         expect(builder.isExcludedResource(tbl2R)).to.be(false);
         expect(builder.isExcludedResource(tbl2W)).to.be(false);
         expect(builder.isExcludedResource(tbl2idR)).to.be(false);
         expect(builder.isExcludedResource(tbl2idW)).to.be(false);
      });

      it('excludes a particular resource for capacity type - tables', function() {
         builder.excludeTable(tbl1R.tableName, tbl1R.capacityType);
         expect(builder.isExcludedResource(tbl1R)).to.be(true);
         expect(builder.isExcludedResource(tbl1W)).to.be(false);
         expect(builder.isExcludedResource(tbl1idR)).to.be(false);
         expect(builder.isExcludedResource(tbl1idW)).to.be(false);
         expect(builder.isExcludedResource(tbl2R)).to.be(false);
         expect(builder.isExcludedResource(tbl2W)).to.be(false);
         expect(builder.isExcludedResource(tbl2idR)).to.be(false);
         expect(builder.isExcludedResource(tbl2idW)).to.be(false);

         builder.excludeTable(tbl1W.tableName, tbl1W.capacityType);
         expect(builder.isExcludedResource(tbl1R)).to.be(true);
         expect(builder.isExcludedResource(tbl1W)).to.be(true);
         expect(builder.isExcludedResource(tbl1idR)).to.be(false);
         expect(builder.isExcludedResource(tbl1idW)).to.be(false);
         expect(builder.isExcludedResource(tbl2R)).to.be(false);
         expect(builder.isExcludedResource(tbl2W)).to.be(false);
         expect(builder.isExcludedResource(tbl2idR)).to.be(false);
         expect(builder.isExcludedResource(tbl2idW)).to.be(false);
      });

      it('excludes a particular resource for capacity type - indexes', function() {
         builder.excludeIndex(tbl1idR.tableName, tbl1idR.indexName, tbl1idR.capacityType);
         expect(builder.isExcludedResource(tbl1R)).to.be(false);
         expect(builder.isExcludedResource(tbl1W)).to.be(false);
         expect(builder.isExcludedResource(tbl1idR)).to.be(true);
         expect(builder.isExcludedResource(tbl1idW)).to.be(false);
         expect(builder.isExcludedResource(tbl2R)).to.be(false);
         expect(builder.isExcludedResource(tbl2W)).to.be(false);
         expect(builder.isExcludedResource(tbl2idR)).to.be(false);
         expect(builder.isExcludedResource(tbl2idW)).to.be(false);

         builder.excludeIndex(tbl1idW.tableName, tbl1idW.indexName, tbl1idW.capacityType);
         expect(builder.isExcludedResource(tbl1R)).to.be(false);
         expect(builder.isExcludedResource(tbl1W)).to.be(false);
         expect(builder.isExcludedResource(tbl1idR)).to.be(true);
         expect(builder.isExcludedResource(tbl1idW)).to.be(true);
         expect(builder.isExcludedResource(tbl2R)).to.be(false);
         expect(builder.isExcludedResource(tbl2W)).to.be(false);
         expect(builder.isExcludedResource(tbl2idR)).to.be(false);
         expect(builder.isExcludedResource(tbl2idW)).to.be(false);
      });

      it('excludes a particular resource when redundance exists', function() {
         builder.excludeTable(tbl1R.tableName, tbl1R.capacityType);
         builder.excludeTable(tbl1R.tableName);
         builder.excludeIndex(tbl2idR.tableName, tbl2idR.indexName);
         builder.excludeIndex(tbl2idR.tableName, tbl2idR.indexName, tbl2idR.capacityType);
         expect(builder.isExcludedResource(tbl1R)).to.be(true);
         expect(builder.isExcludedResource(tbl1W)).to.be(true);
         expect(builder.isExcludedResource(tbl1idR)).to.be(false);
         expect(builder.isExcludedResource(tbl1idW)).to.be(false);
         expect(builder.isExcludedResource(tbl2R)).to.be(false);
         expect(builder.isExcludedResource(tbl2W)).to.be(false);
         expect(builder.isExcludedResource(tbl2idR)).to.be(true);
         expect(builder.isExcludedResource(tbl2idW)).to.be(true);
      });

   });

   describe('rule configuration', function() {

      it('allows config to be added in a chain', function() {
         expect(builder.ruleConfigForTable(tbl1R.tableName, tbl1R.capacityType, {})).to.be(builder);
         expect(builder.ruleConfigForTable(tbl1W.tableName, tbl1W.capacityType, {})).to.be(builder);
         expect(builder.ruleConfigForIndex(tbl1idR.tableName, tbl1idR.indexName, tbl1idR.capacityType, {})).to.be(builder);
         expect(builder.ruleConfigForIndex(tbl1idW.tableName, tbl1idW.indexName, tbl1idW.capacityType, {})).to.be(builder);
      });

      it('uses global defaults when no other config is present', function() {
         expect(builder.getConfigForResource(tbl1R)).to.eql(DCM.DEFAULT_RESOURCE_CONFIG);
         expect(builder.getConfigForResource(tbl1W)).to.eql(DCM.DEFAULT_RESOURCE_CONFIG);
         expect(builder.getConfigForResource(tbl1idR)).to.eql(DCM.DEFAULT_RESOURCE_CONFIG);
         expect(builder.getConfigForResource(tbl1idW)).to.eql(DCM.DEFAULT_RESOURCE_CONFIG);
      });

      describe('user defaults', function() {

         it('allows config to be added in a chain', function() {
            expect(builder.defaultRuleConfig({})).to.be(builder);
            expect(builder.defaultRuleConfig('WriteCapacityUnits', {})).to.be(builder);
         });

         it('allows user to set their own defaults', function() {
            var customConfig,
                expectedConfig;

            customConfig = {
               AbsoluteMinimumProvisioned: 9999,
               MinimumMinutesBetweenIncreases: 9998,
            };

            expect(customConfig.AbsoluteMinimumProvisioned).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.AbsoluteMinimumProvisioned);
            expect(customConfig.MinimumMinutesBetweenIncreases).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.MinimumMinutesBetweenIncreases);

            expectedConfig = _.extend({}, DCM.DEFAULT_RESOURCE_CONFIG, customConfig);

            builder.defaultRuleConfig(customConfig);

            expect(builder.getConfigForResource(tbl1R)).to.eql(expectedConfig);
            expect(builder.getConfigForResource(tbl1W)).to.eql(expectedConfig);
            expect(builder.getConfigForResource(tbl1idR)).to.eql(expectedConfig);
            expect(builder.getConfigForResource(tbl1idW)).to.eql(expectedConfig);
         });

         it('allows user to set their own defaults for a specific type', function() {
            var customReadConfig,
                customWriteConfig,
                expectedReadConfig,
                expectedWriteConfig;

            customReadConfig = {
               AbsoluteMinimumProvisioned: 9999,
               MinimumMinutesBetweenIncreases: 9998,
            };

            customWriteConfig = {
               AbsoluteMaximumProvisioned: 9999,
               MinimumMinutesBetweenIncreases: 9997,
            };

            expect(customReadConfig.AbsoluteMinimumProvisioned).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.AbsoluteMinimumProvisioned);
            expect(customReadConfig.MinimumMinutesBetweenIncreases).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.MinimumMinutesBetweenIncreases);
            expect(customWriteConfig.AbsoluteMaximumProvisioned).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.AbsoluteMaximumProvisioned);
            expect(customWriteConfig.MinimumMinutesBetweenIncreases).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.MinimumMinutesBetweenIncreases);

            expectedReadConfig = _.extend({}, DCM.DEFAULT_RESOURCE_CONFIG, customReadConfig);
            expectedWriteConfig = _.extend({}, DCM.DEFAULT_RESOURCE_CONFIG, customWriteConfig);

            builder.defaultRuleConfig(DCM.READ, customReadConfig);
            builder.defaultRuleConfig(DCM.WRITE, customWriteConfig);

            expect(builder.getConfigForResource(tbl1R)).to.eql(expectedReadConfig);
            expect(builder.getConfigForResource(tbl1W)).to.eql(expectedWriteConfig);
            expect(builder.getConfigForResource(tbl1idR)).to.eql(expectedReadConfig);
            expect(builder.getConfigForResource(tbl1idW)).to.eql(expectedWriteConfig);
         });

      });

      describe('resource specific config', function() {

         it('allows config to be added in a chain', function() {
            expect(builder.ruleConfigForTable(tbl1R.tableName, tbl1R.capacityType, {})).to.be(builder);
            expect(builder.ruleConfigForIndex(tbl1idR.tableName, tbl1idR.indexName, tbl1idR.capacityType, {})).to.be(builder);
         });

         it('allows for custom config for a specific table', function() {
            var customConfig,
                expectedConfig;

            customConfig = {
               AbsoluteMinimumProvisioned: 9999,
               MinimumMinutesBetweenIncreases: 9998,
            };

            expect(customConfig.AbsoluteMinimumProvisioned).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.AbsoluteMinimumProvisioned);
            expect(customConfig.MinimumMinutesBetweenIncreases).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.MinimumMinutesBetweenIncreases);

            expectedConfig = _.extend({}, DCM.DEFAULT_RESOURCE_CONFIG, customConfig);

            builder.ruleConfigForTable(tbl1R.tableName, tbl1R.capacityType, customConfig);

            expect(builder.getConfigForResource(tbl1R)).to.eql(expectedConfig);
            expect(builder.getConfigForResource(tbl1W)).to.eql(DCM.DEFAULT_RESOURCE_CONFIG);
            expect(builder.getConfigForResource(tbl1idR)).to.eql(DCM.DEFAULT_RESOURCE_CONFIG);
            expect(builder.getConfigForResource(tbl1idW)).to.eql(DCM.DEFAULT_RESOURCE_CONFIG);
         });

         it('allows for custom config for a specific index', function() {
            var customConfig,
                expectedConfig;

            customConfig = {
               AbsoluteMinimumProvisioned: 9999,
               MinimumMinutesBetweenIncreases: 9998,
            };

            expect(customConfig.AbsoluteMinimumProvisioned).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.AbsoluteMinimumProvisioned);
            expect(customConfig.MinimumMinutesBetweenIncreases).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.MinimumMinutesBetweenIncreases);

            expectedConfig = _.extend({}, DCM.DEFAULT_RESOURCE_CONFIG, customConfig);

            builder.ruleConfigForIndex(tbl1idR.tableName, tbl1idR.indexName, tbl1idR.capacityType, customConfig);

            expect(builder.getConfigForResource(tbl1R)).to.eql(DCM.DEFAULT_RESOURCE_CONFIG);
            expect(builder.getConfigForResource(tbl1W)).to.eql(DCM.DEFAULT_RESOURCE_CONFIG);
            expect(builder.getConfigForResource(tbl1idR)).to.eql(expectedConfig);
            expect(builder.getConfigForResource(tbl1idW)).to.eql(DCM.DEFAULT_RESOURCE_CONFIG);
         });

      });

      it('allows all config levels play nice together', function() {
         var customConfig,
             customReadConfig,
             customResourceConfig,
             expectedConfig;

         customConfig = {
            AbsoluteMinimumProvisioned: 9999,
            AbsoluteMaximumProvisioned: 9998,
            MinutesOfStatsToRetrieve: 9997,
            MinutesOfStatsToIgnore: 9996,
         };

         customReadConfig = {
            AbsoluteMaximumProvisioned: 8999,
            MinutesOfStatsToRetrieve: 8998,
            MinutesOfStatsToIgnore: 8997,
         };

         customResourceConfig = {
            MinutesOfStatsToRetrieve: 6999,
            MinutesOfStatsToIgnore: 6998
         };

         expectedConfig = _.extend({}, DCM.DEFAULT_RESOURCE_CONFIG);

         expectedConfig.AbsoluteMinimumProvisioned = customConfig.AbsoluteMinimumProvisioned;
         expectedConfig.AbsoluteMaximumProvisioned = customReadConfig.AbsoluteMaximumProvisioned;
         expectedConfig.MinutesOfStatsToRetrieve = customResourceConfig.MinutesOfStatsToRetrieve;
         expectedConfig.MinutesOfStatsToIgnore = customResourceConfig.MinutesOfStatsToIgnore;

         expect(expect.AbsoluteMinimumProvisioned).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.AbsoluteMinimumProvisioned);
         expect(expect.AbsoluteMaximumProvisioned).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.AbsoluteMaximumProvisioned);
         expect(expect.MinutesOfStatsToRetrieve).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.MinutesOfStatsToRetrieve);
         expect(expect.MinutesOfStatsToIgnore).to.not.eql(DCM.DEFAULT_RESOURCE_CONFIG.MinutesOfStatsToIgnore);

         builder.defaultRuleConfig(customConfig);
         builder.defaultRuleConfig(DCM.READ, customReadConfig);
         builder.ruleConfigForTable(tbl1R.tableName, tbl1R.capacityType, customResourceConfig);

         expect(builder.getConfigForResource(tbl1R)).to.eql(expectedConfig);
      });

   });

});
