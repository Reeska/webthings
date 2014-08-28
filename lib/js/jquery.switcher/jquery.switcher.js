/*
 * File:        jquery.switcher.js
 * Version:     1.0.0
 * Author:      Thomas Champion
 * 
 * Plugin permettant l'affichage de certain élément en fonction de la 
 * sélection de certaines valeurs dans des listes (select) ou bouton radio, ou autres. 
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
 */
(function($) {
	$.fn.switcher = function() {
		return this.change(function() {
			var self = $(this);
			
			if (self.is(':radio')) {
				var shower = self;
				var others = $('input[name="' + shower.attr('name') + '"][data-show]');
			} else if (self.is('select')) {
				var shower = $("option:selected", this);
				var others = $('option[data-show]', this);			
			}
			
			var show = shower.data('show');
			
			/*
			 * Hide all other option dependancies
			 */
			others.each(function() {
				var self = $(this);
				
				if (self.is(':checked'))
					return;
				
				$(self.data('show')).hide();
			});
			
			/*
			 * Show current option dependancy
			 */
			if (show)
				$(show).show();		
		}).change();
	};
})(jQuery);
