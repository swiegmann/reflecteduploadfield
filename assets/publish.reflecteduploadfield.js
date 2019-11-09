/*
	Copyright: Deux Huit Huit 2014
	License: MIT, see the LICENCE file
*/

/**
 * JS for entry relationship field
 */
 
 // TO-DO: Add Mutation-Observer

(function ($, undefined) {

	'use strict';

	window.ReflectedUploadField = {
		
		_init: false,
		_selectorUploadField: "div.field.field-reflectedupload.required",
		_selectorFilenameField: "div.field.field-uniqueinput.required, div.field.field-textbox.required",

		init: function() {
			if (this._init) return;
			
			var _this = this,
				elRoot = jQuery("#contents"),
				elUploadFieldContainers = elRoot.find(_this._selectorUploadField);
			
			if (!elUploadFieldContainers.length) return;
			
			var	elUploadFields = elUploadFieldContainers.find("input[type='file']");
			
			this.addUploadFieldEvent(elUploadFields);
			
			
			// Following next "Text-Box"-Fields (which are assumed Filename-Fields)
			var	filenameFieldContainers = elUploadFieldContainers.next(_this._selectorFilenameField),
				filenameFields = filenameFieldContainers.find("input[name^='fields['][type='text']");
				
			filenameFields.on("blur", function(e) {	
				var el = jQuery(this);
				
				if (!this.value.length) {
					// Try to fetch Filename from Upload-Field
					var elUploadFieldContainer = el.parents(_this._selectorFilenameField).prev(_this._selectorUploadField),
						elUploadField = elUploadFieldContainer.find("input[name^='fields['][type='file'], input[name^='fields['][type='hidden']");
						
					if (elUploadField.length && elUploadField[0].value !== "") {
						var s = _this.extractFilename(elUploadField[0].value);
						_this.updateField(el, s);
					}
					
					return;
				}
				
				_this.updateField(el, el.val());
			});
			
			
			// Add Mutation-Observer:
			var observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					if (mutation.target.tagName == "SPAN" && mutation.target.className == "frame" && mutation.addedNodes.length) {
						var el = jQuery(mutation.addedNodes[0]);
						_this.addUploadFieldEvent(el);
					}
				});    
			});
			
			observer.observe(document.querySelector('#contents'), {
				attributes: false,
				childList: true,
				characterData: false,
				subtree: true
			});
			
			this._init = true;
		},
				
		addUploadFieldEvent(el) {
			var _this = this;
			
			el.off("change.updateField").on("change.updateField", function(e) {				
				var el = jQuery(this);
				
				var	filenameFieldContainer = el.parents(_this.selectorUploadField).next(_this._selectorFilenameField),
					filenameField = filenameFieldContainer.find("input[name^='fields['][type='text']");
				
				if (!filenameField || !filenameField.length || filenameField[0].value !== "") return;
				
				var s = el.val();
				
				s = _this.extractFilename(s);
				
				_this.updateField(filenameField, s);
			});
		},
		
		extractFilename(s) {
			s = s.substr(s.lastIndexOf("\\")+1) // Remove Upload-Path
			s = s.substr(s.lastIndexOf("/")+1) // Remove Upload-Path
			
			var i = s.lastIndexOf(".");
			s = (i !== -1) ? s.substring(0, i) : s;
			
			return s;
		},
		
		updateField(el, value) {
			var s = value;
			
			var s = s.toLowerCase() // Lowercase
				.replace(/[^a-z0-9\-]/g, '-') // Forbidden Chars -> "-"
				.replace(/\-{2,}/g, '-') // Multiple "-" -> "-"
				.replace(/^\-/g, '') // Starts with "-", remove
				.replace(/\-$/g, '') // Ends with "-", remove
			
			el[0].value = s;
			el.attr("value", s);			
		}
	};	

	$(function() {
		ReflectedUploadField.init();
	});

})(jQuery);