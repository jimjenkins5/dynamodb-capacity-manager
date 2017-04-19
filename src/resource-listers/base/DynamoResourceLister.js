'use strict';

var _ = require('underscore'),
    Q = require('q'),
    Class = require('class.extend'),
    AWS = require('aws-sdk'),
    constants = require('../../constants'),
    resourceUtils = require('../../util/resource'),
    dynamo = new AWS.DynamoDB();

module.exports = Class.extend({

   listResources: function() {
      var self = this;

      return this._fetchTableNames()
         .then(function(tableNames) {
            return _.reduce(tableNames, function(prev, tableName) {
               return prev.then(function(resources) {
                  return self.convertTableNameToResources(tableName)
                     .then(function(tableResources) {
                        return resources.concat(tableResources);
                     });
               });
            }, Q.when([]));
         });
   },

   _fetchTableNames: function() {
      throw new Error('Subclasses of "DynamoResourceLister" must override "_fetchTableNames"');
   },

   convertTableNameToResources: function(tableName) {
      return Q.ninvoke(dynamo, 'describeTable', { TableName: tableName })
         .then(function(resp) {
            var resources = [];

            resources.push(this.convertTableToResource(resp.Table, constants.READ));
            resources.push(this.convertTableToResource(resp.Table, constants.WRITE));

            _.each(resp.Table.GlobalSecondaryIndexes, function(index) {
               resources.push(this.convertIndexToResource(resp.Table.TableName, index, constants.READ));
               resources.push(this.convertIndexToResource(resp.Table.TableName, index, constants.WRITE));
            }.bind(this));

            return resources;
         }.bind(this));
   },

   convertTableToResource: function(table, capacityType) {
      return {
         resourceType: 'table',
         name: resourceUtils.makeResourceName(table.TableName),
         tableName: table.TableName,
         capacityType: capacityType,
         provisioning: {
            lastIncrease: table.ProvisionedThroughput.LastIncreaseDateTime,
            lastDecrease: table.ProvisionedThroughput.LastDecreaseDateTime,
            numberOfDecreasesToday: table.ProvisionedThroughput.NumberOfDecreasesToday,
            currentCapacity: table.ProvisionedThroughput[capacityType],
         },
      };
   },

   convertIndexToResource: function(tableName, index, capacityType) {
      return {
         resourceType: 'index',
         name: resourceUtils.makeResourceName(tableName, index.IndexName),
         tableName: tableName,
         indexName: index.IndexName,
         capacityType: capacityType,
         provisioning: {
            lastIncrease: index.ProvisionedThroughput.LastIncreaseDateTime,
            lastDecrease: index.ProvisionedThroughput.LastDecreaseDateTime,
            numberOfDecreasesToday: index.ProvisionedThroughput.NumberOfDecreasesToday,
            currentCapacity: index.ProvisionedThroughput[capacityType],
         },
      };
   },

});
