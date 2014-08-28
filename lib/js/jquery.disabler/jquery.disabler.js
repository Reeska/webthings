/** 
 * File: jquery.disabler.js 
 * Version: 1.0.0 
 * Author: Thomas Champion 
 * Require: jquery.bind-first.js 
 *
 * Activation/Désactivation d'éléments par le bloquage des événements (click, hover etc...) 
 * 
 * $('.button').enable(); * $('.button').disable(); 
 */
(function($) {	
	/**	 
	 * Désactive les éléments : bloque les événements défini par l'argument events (par défaut click)	 
	 * @param string liste des événements à désactiver séparés par un espace (ex: "click mouseenter focus") 	 
	 * @return jQuery	 
	 */	
	$.fn.disable = function(events) {
		return this.each(function() {
			var self = $(this);
			var evt = events || 'click';

			/*
			 * si l'élément n'est pas désactivable, on sort
			 */
			if (self.is('.notdisableable'))
				return;
				
			$.each(evt.split(/\s+/), function(i, evt) {
				/*
				 * ajoute un handler bloquant en haut de la pile des handlers pour l'événement donné
				 */
				self.addClass('disablify_'+evt)
				.bindFirst(evt + '.disable', function(e) {
					e.stopImmediatePropagation();
					e.stopPropagation();
					return false;
				})
				/*
				 * sauvegarde l'événement défini par l'attribut html (onclick, ...)
				 */
				.data('oldon' + evt + '.disable', self.attr('on' + evt));
				self.attr('on' + evt, null);
			});
		});	
	};	

	/**	 
	 * Réactive les éléments : débloque les événements défini par l'argument events (par défaut click)	 
	 * @param string liste des événements à réactiver séparés par un espace (ex: "click mouseenter focus") 	 
	 * @return jQuery	 
	 */
	$.fn.enable = function(events) {
		return this.each(function() {	        
			var self = $(this);	        
			var evt = events || 'click';	        
			$.each(evt.split(/\s+/), function(i, evt) {
				if (!self.is('.disablify_'+evt))
					return;

				/*
				 * on supprime le handler bloquant et on restore la valeur de l'attribut onevt (onclick, ...)
				 */
				self.removeClass('disablify_'+evt)
					.unbind(evt + '.disable')
					.attr('on' + evt, self.data('oldon' + evt + '.disable'));
			});	    
		});	
	};
})(jQuery);