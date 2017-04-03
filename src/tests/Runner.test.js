'use strict';

var _ = require('underscore'),
    expect = require('expect.js'),
    Runner = require('../Runner');

describe('Runner', function() {

   var builder, runner;

   beforeEach(function() {
      builder = {
         _handleReads: true,
         _handleWrites: true,
         isExcludedResource: function() {
            return false;
         }
      };
      runner = new Runner(builder);
   });

   describe('_removeExcludedResources', function() {
      var tbl1R = { resourceType: 'table', name: 'Tbl1', tableName: 'Tbl1', capacityType: 'ReadCapacityUnits' },
          tbl1W = { resourceType: 'table', name: 'Tbl1', tableName: 'Tbl1', capacityType: 'WriteCapacityUnits' },
          tbl1idR = { resourceType: 'index', name: 'Tbl1::_id', tableName: 'Tbl1', indexName: '_id', capacityType: 'ReadCapacityUnits' },
          tbl1idW = { resourceType: 'index', name: 'Tbl1::_id', tableName: 'Tbl1', indexName: '_id', capacityType: 'WriteCapacityUnits' },
          tbl2R = { resourceType: 'table', name: 'Tbl2', tableName: 'Tbl2', capacityType: 'ReadCapacityUnits' },
          tbl2W = { resourceType: 'table', name: 'Tbl2', tableName: 'Tbl2', capacityType: 'WriteCapacityUnits' },
          tbl2idR = { resourceType: 'index', name: 'Tbl2::_id', tableName: 'Tbl2', indexName: '_id', capacityType: 'ReadCapacityUnits' },
          tbl2idW = { resourceType: 'index', name: 'Tbl2::_id', tableName: 'Tbl2', indexName: '_id', capacityType: 'WriteCapacityUnits' },
          resources = [ tbl1R, tbl1W, tbl1idR, tbl1idW, tbl2R, tbl2W, tbl2idR, tbl2idW ];

      it('removes all resources of a particular type when builder is not handling that type', function() {
         builder._handleReads = false;
         expect(runner._removeExcludedResources(resources)).to.eql(_.without(resources, tbl1R, tbl1idR, tbl2R, tbl2idR));
      });

      it('removes tables when returned as excluded', function() {
         builder.isExcludedResource = function(resource) {
            return resource.name === 'Tbl1';
         };
         expect(runner._removeExcludedResources(resources)).to.eql(_.without(resources, tbl1R, tbl1W));
      });

      it('removes indexes when returned as excluded', function() {
         builder.isExcludedResource = function(resource) {
            return resource.name === 'Tbl1::_id';
         };
         expect(runner._removeExcludedResources(resources)).to.eql(_.without(resources, tbl1idR, tbl1idW));
      });

      it('removes multiple resource types as specified', function() {
         builder.isExcludedResource = function(resource) {
            return resource.name === 'Tbl1' || resource.name === 'Tbl2::_id';
         };
         expect(runner._removeExcludedResources(resources)).to.eql(_.without(resources, tbl1R, tbl1W, tbl2idR, tbl2idW));
      });

      it('combines multiple exclusions as expected - with builder only handling one capacity type, and redundant exclusions', function() {
         builder._handleWrites = false;
         builder.isExcludedResource = function(resource) {
            return resource.name === 'Tbl1' || resource.name === 'Tbl2::_id';
         };

         expect(runner._removeExcludedResources(resources))
            .to
            .eql(_.without(resources, tbl1W, tbl1idW, tbl2W, tbl2idW, tbl1R, tbl2idR));
      });

   });

});
