'use strict';

var _ = require('underscore'),
    Class = require('class.extend'),
    minimatch = require('minimatch'),
    Runner = require('./Runner'),
    DCM = require('./index');

module.exports = Class.extend({

   init: function() {
      this._resourceLister = null;
      this._excludedResources = [];
      this._handleReads = false;
      this._handleWrites = false;
      this._userDefaultConfig = {};
      this._userDefaultConfigByType = {};
      this._perResourceConfigs = {};
   },

   findResourcesWith: function(resourceLister) {
      this._resourceLister = resourceLister;
      return this;
   },

   excludeTable: function(tableName, capacityType, alsoExcludeIndexes) {
      this._excludedResources.push({
         resourceType: 'table',
         name: DCM.makeResourceName(tableName),
         capacityType: capacityType,
      });

      if (alsoExcludeIndexes) {
         this.excludeIndex(tableName, '*', capacityType);
      }
   },

   excludeIndex: function(tableName, indexName, capacityType) {
      this._excludedResources.push({
         resourceType: 'index',
         name: DCM.makeResourceName(tableName, indexName),
         capacityType: capacityType,
      });
   },

   isExcludedResource: function(resource) {
      return !!_.find(this._excludedResources, function(exc) {
         var isCorrectResource;

         isCorrectResource = (resource.resourceType === exc.resourceType
            && minimatch(resource.name, exc.name));

         if (!isCorrectResource) {
            return false;
         }

         if (exc.capacityType) {
            return resource.capacityType === exc.capacityType;
         }

         // this is the correct resource, and no exclusion type was specified, so the
         // user wants the resource entirely excluded, not just one type
         return true;
      });
   },

   handleReads: function() {
      this._handleReads = true;
      return this;
   },

   handleWrites: function() {
      this._handleWrites = true;
      return this;
   },

   handleReadsAndWrites: function() {
      return this.handleReads().handleWrites();
   },

   defaultRuleConfig: function(type, config) {
      // NOTE: type is optional
      if (type && config) {
         if (_.isString(type) && _.isObject(config)) {
            this._userDefaultConfigByType[type] = config;
         } else {
            throw new Error('When both type and config are supplied to defaultRuleConfig, type must be a string, and config an object');
         }
      } else if (_.isObject(type)) {
         // type, not config - because type wasn't supplied
         this._userDefaultConfig = type || {};
      } else {
         throw new Error('When no type is supplied to defaultRuleConfig, the first parameter must be an object');
      }

      return this;
   },

   ruleConfigForTable: function(tableName, type, config) {
      return this._saveRuleConfigForResource(tableName, undefined, type, config);
   },

   ruleConfigForIndex: function(tableName, indexName, type, config) {
      return this._saveRuleConfigForResource(tableName, indexName, type, config);
   },

   _saveRuleConfigForResource: function(tableName, indexName, type, config) {
      var resourceName = DCM.makeResourceName(tableName, indexName);

      if (!this._perResourceConfigs[resourceName]) {
         this._perResourceConfigs[resourceName] = {};
      }

      this._perResourceConfigs[resourceName][type] = config;
      return this;
   },

   getConfigForResource: function(resource) {
      var perResource = this._perResourceConfigs[resource.name],
          defaultForType = this._userDefaultConfigByType[resource.capacityType],
          forResourceType = perResource ? perResource[resource.capacityType] : {};

      return _.extend({}, DCM.DEFAULT_RESOURCE_CONFIG, this._userDefaultConfig, defaultForType, forResourceType);
   },

   build: function() {
      // TODO: validate that required configuration was supplied
      return new Runner(this);
   },

});
