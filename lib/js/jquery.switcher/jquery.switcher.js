/*
 * File:        jquery.switcher.js
 * Version:     1.0.0
 * Author:      Thomas Champion <thchampi@gmail.com>
 * 
 * Plugin permettant l'affichage de l'élement dont le selecteur est précisé dans
 * l'attribut data-show du "bouton", et masque les éléments des autres boutons "bouton".
 * Fonctionne avec les listes (select), bouton radio, ou autres.
 * 
 * Usage:
 * 
 * <select>
 * 	<option data-show="#bloc1">Option 1</option>
 * 	<option data-show="#bloc2">Option 2</option>
 * </select>
 * 
 * <div id="bloc1">Contenu 1</div>
 * <div id="bloc2">Contenu 2</div>
 * 
 * $('select').switcher();
 * 
 * Options:
 * 
 * Les options permettant d'ajouter des comportements spécifiques, elles s'activent via des data-attributs de la manière suivante :
 * 
 * <select data-reset-fields-on-hide="true">
 * 	<option data-show="#bloc1">Option 1</option>
 * 	<option data-show="#bloc2">Option 2</option>
 * </select>
 */
(function($) {
	$.fn.switcher = function(settings) {
		var config = $.extend({}, {
			onShow : function(opts,target) {},		// appelé lors de l'action show
			onHide : function(opts,target) {},		// appelé lors de l'action hide
			onAlways : function(showing,opts,target) {}	// appelé dans les deux cas 
		}, settings);
			
		function opts(self) {
			return $.extend({}, config, self.data());
		}
		
		function postactions(showing, opt, trigger) {
			var self = this;
			$.each($.fn.switcher.postActions, function(idx, elem) {
				elem.apply(self, [showing, opt, trigger]);
			});
		}		
		
		var handlers = {
			showing : function(self, trigger) {
				if (!self || !self.length)
					return;
				
				var o = opts(trigger);
				self.show();
				
				config.onShow	.apply(self, [o, trigger]);
				config.onAlways	.apply(self, [true, o, trigger]);				
				postactions		.apply(self, [true, o, trigger]);
			},
			hiding : function(self, trigger) {
				if (!self || !self.length)
					return;
				
				var o = opts(trigger);
				self.hide();	
				
				config.onHide	.apply(self, [o, trigger]);
				config.onAlways	.apply(self, [false, o, trigger]);
				postactions		.apply(self, [false, o, trigger]);
			}
		};
		
		return this.each(function() {
			var self = $(this);
			
			/*
			 * initialized
			 */
			if (self.data('switcher'))
				return;
			
			self.change(function() {
				var shower = self, others= [];
				
				if (self.is(':radio')) {
					shower = self;
					others = $('input[name="' + shower.attr('name') + '"][data-show]');
				} else if (self.is('select')) {
					var d = $(self.data('default'));				
					handlers.hiding(d, self);
					
					shower = $("option:selected", this);
					others = $('option[data-show]', this);			
				}
				
				var show = shower.data('show'),
					treat = {}; // to mark as treated
				
				/*
				 * Hide all other option dependencies
				 */
				others.each(function() {
				    var o = $(this);
				    var dshow = o.data('show');
				   
				    if (treat[dshow] || o.is(':checked,:selected'))
						return;
				   
				    handlers.hiding($(dshow), self);
				    treat[dshow] = true;
			   });
			   
			   /*
				* Show current option dependency
				*/
				if (show && (self.is(':checked') || self.is('select'))) {
					handlers.showing($(show), self);
				} else if(!shower.data('noshow')) {
					handlers.showing($(self.data('default')), self);
				}
			})
			.change()
			.data('switcher', { init : true });
		});
	};
	
	/*
	 * Allow to add extended behavior like post treatement with :
	 * 
	 * $.fn.switcher.postActions.push(function(showing, data) { ... })
	 */
	$.extend($.fn.switcher, {
		postActions : []
	});
})(jQuery);

/*
 * jQuery Switcher Form Post Actions Extension
 * 
 * Switcher extension : add specific post treatment for form field :
 * ex: enable field on show, disable field on hide.  
 *
 * Options :
 * 
 * - switcher-disable : détermine s'il faut désactiver les champs cachés (true par défaut).
 * - switcher-enable-all : détermine s'il faut activer tous les champs de la zone (false par défaut).
 * - reset-field-on-hide : détermine s'il faut vider les champs au masquage (false par défaut).
 */
(function($) {
	$.fn.switcher.postActions.push(
		function (showing, data) {
			var config = $.extend({}, {
				switcherDisable : true,		// détermine s'il faut désactiver les champs cachés
				switcherEnableAll : false,	// détermine s'il faut activer tous les champs de la zone
				resetFieldsOnHide : false	// détermine s'il faut vider les champs cachés
			}, data);
			
			var fields = $('select,input,textarea', this),
			target = $(this);
			
			/**
			 * Empty field on hidding
			 */
			if (!showing && config.resetFieldsOnHide)
				$('input:not([name="submit"]), textarea, select')
					.val(null)
					.change();			

			/**
			 * La désactivation des champs n'est pas positionné, 
			 * on réactive les champs s'ils ont été désactivés par ailleurs 
			 * ssi ils ne sont pas dans une zone désactivée
			 */
			if (!config.switcherDisable) {
				fields.prop('disabled', !!target.parents('.switcher-disabled').length);
				return;
			}
			
			/**
			 * Mark target block as disabled/enabled
			 */
			if (!showing)
				target.addClass('switcher-disabled');
			else
				target.removeClass('switcher-disabled');
			
			/*
			 * enable inputs
			 */
			fields
			 	.prop('disabled', false);	
			 
			/*
			 * disable inputs which has hidden parent only if opt enableAll is false
			 */	
			if (!config.switcherEnableAll)
				$(':hidden select, :hidden input, :hidden textarea', this)
					.filter(':not(.notdisableable)')
					.prop('disabled', true);		
		}
	);	
})(jQuery);