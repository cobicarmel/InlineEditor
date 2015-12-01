'use strict';

var InlineEditor = function(userSettings){

	var settings = {},
		elements = {},
		variables = {},
		self = this;

	var init = function(){

		initSettings();

		initElements();

		attachEvents();
	};

	var attachEvents = function(){

		attachTriggerEvent();

		elements.$editor.on('blur', self.completeEdit);
	};

	var attachTriggerEvent = function(){

		elements.$trigger
			.off('click', self.edit)
			.on('click', self.edit);
	};

	var getDefaultElements = function(){

		return {
			$wrapper: $('<div>', {class: settings.classes.wrapper}),
			$editor: $('<textarea>', {class: settings.classes.editor}),
			$element: $(settings.element),
			$trigger: $(settings.trigger || settings.element)
		};
	};

	var getDefaultSettings = function(){

		return {
			editorStyle: {},
			classes: {
				wrapper: 'ei-wrapper',
				editor: 'ei-editor'
			},
			element: null,
			sizes: {
				width: 'element',
				height: 'element',
				min: {
					width: 100,
					height: 15
				},
				max: {
					width: 'element',
					height: null
				}
			},
			allowEmpty: true,
			inputIsValid: null,
			onEditSucceed: null
		};
	};

	var initElements = function(){

		elements = getDefaultElements();
	};

	var initSettings = function(){

		var defaultSettings = getDefaultSettings();

		$.extend(true, settings, defaultSettings, userSettings);
	};

	var validateInput = function(){

		var value = self.getEditorValue();

		if(value === '' && !settings.allowEmpty)
			return false;

		if($.isFunction(settings.inputIsValid))
			return settings.inputIsValid.call(elements.$editor, value, self);

		return true;
	};

	var computeEditorSize = function(){

		var elementSize = self.getElementSize(),
			editorSizes = {},
			parsedSizes = parseSizes();

		['width', 'height'].forEach(function(sizeType){

			editorSizes[sizeType] = parsedSizes[sizeType];

			if(parsedSizes.min[sizeType]) {

				editorSizes[sizeType] = Math.max(parsedSizes.min[sizeType], editorSizes[sizeType]);

				editorSizes['min-' + sizeType] = parsedSizes.min[sizeType];
			}

			if(parsedSizes.max[sizeType]) {

				editorSizes[sizeType] = Math.min(parsedSizes.max[sizeType], editorSizes[sizeType]);

				editorSizes['max-' + sizeType] = parsedSizes.max[sizeType];
			}
		});

		return editorSizes;
	};

	var parseSizes = function(container){

		if(!container)
			container = $.extend(true, {}, settings.sizes);

		$.each(container, function(key, value){

			if(value === null)
				return;

			var valueType = typeof value;

			if(valueType == 'object')
				return container[key] = parseSizes(value);

			if(valueType == 'string') {

				value = value.trim();

				if(value.match(/^element/)) {

					var elementSize = self.getElementSize(key),
						expression = value.match(/^element *([\+\*\-\/]) *(\d+)/);

					if(expression) {

						var additionalValue = parseFloat(expression[2]);

						switch(expression[1]) {
							case '+':
								elementSize += additionalValue;
								break;
							case '-':
								elementSize -= additionalValue;
								break;
							case '*':
								elementSize *= additionalValue;
								break;
							case '/':
								elementSize /= additionalValue;
								break;
						}
					}

					value = elementSize;
				}
			}

			container[key] = parseFloat(value);
		});

		return container;
	};

	this.addTrigger = function(triggerElement){

		elements.$trigger = elements.$trigger.add(triggerElement);

		attachTriggerEvent();
	};

	this.cancelEdit = function(){

		self.hide();

		elements.$element.text(variables.oldElementValue);
	};

	this.completeEdit = function(){

		var isValid = validateInput();

		if(isValid)
			self.successEdit();
		else
			self.cancelEdit();
	};

	this.edit = function(){

		var editorSize = computeEditorSize();

		elements.$editor.css(editorSize);

		var elementValue = self.getElementValue();

		variables.oldElementValue = elementValue;

		elements.$editor.val(elementValue);

		elements.$element.after(elements.$editor).hide();

		elements.$editor.show().focus();
	};

	this.hide = function(){

		elements.$editor.hide();

		elements.$element.show();
	};

	this.getEditorValue = function(){

		return elements.$editor.val();
	};

	this.getElementValue = function(){

		return elements.$element.text();
	};

	this.getElementSize = function(size){

		var sizes = {
			width: elements.$element.outerWidth(),
			height: elements.$element.outerHeight()
		};

		if(size)
			return sizes[size];

		return sizes;
	};

	this.getElements = function(element){

		if(element)
			return elements[element];

		return elements;
	};

	this.getSettings = function(setting){

		if(setting)
			return settings[setting];

		return settings;
	};

	this.successEdit = function(){

		self.hide();

		variables.newValue = self.getEditorValue();

		elements.$element.text(variables.newValue);

		if($.isFunction(settings.onEditSucceed))
			settings.onEditSucceed(variables.newValue, variables.oldElementValue, self);
	};

	init();
};