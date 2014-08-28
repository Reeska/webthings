/*
 * File:        jquery.dependon.js
 * Version:     1.0.0
 * Author:      Thomas Champion <thchampi@gmail.com>
 * 
 * Plugin servant à le remplissage de liste dépendant de la valeur sélectionnée
 * dans une autre liste.
 */
(function($) {
	$.fn.dependOn = function(options) {
		var opts = $.extend({}, {
			selectOne : true,	// si un seul choix on le sélectionne
			values : {},		// table associative clé - valeurs, ex: { key : ["val1", "val2", "val3"] }
			mode : 'static',	// mode de recherche des valeurs : static, ajax
			url : "",			// url pour le mode ajax
			datatype : "json",	// datatype pour le mode ajax,
			defaultHtml : '<option>...</option>'
		}, options);
		
		this.each(function() {
			var self = $(this);
			var data = self.data();
			
			/**
			 * Rempli la liste de premier niveau qui n'a pas de dépendance 
			 */
			if (!data.dependon) {
				process(self, opts, '*', true);
				return;
			}
			
			var dependency = $(data.dependon);
			
			/**
			 * Au changement de la liste dont dépend self,
			 * il faut recharger la liste courante. 
			 */
			dependency.change(function() {	
				var val = dependency.val();
				
				/*
				 * Remplissage de la liste en fonction du mode
				 */
				process(self, opts, val);
				
				/*
				 * On force le déclenchement du process pour la liste courante
				 */
				self.change();
			}).change();
		});
	};
	
	/**
	 * Récupère les valeurs pour la clé val et génère la liste
	 */
	function process(self, opts, val, root) {
		switch (opts.mode) {
			case 'static':
				var values = root ? opts.values : opts.values[val];
				render(self, opts, values);
				break;
			case 'ajax':
				$.get(url, { key : val, root : root }, function(data) {
					render(self, opts, data);
				}, opts.datatype);
				break;
		}				
	}	
	
	/**
	 * Remplissage du select avec la liste des valeurs
	 */	
	function render(self, opts, values) {
		/*
		 * Reset le select
		 */		
		self.html(opts.defaultHtml);			
		
		if (!values)
			return;	
		
		$.each(values, function(idx, elem) {
			self.append('<option>' + elem + '</option>');
		});	
		
		/*
		 * Un seul élément donc on le sélectionne
		 */
		if (opts.selectOne && self[0].length == 2) {
			self[0].selectedIndex = 1;
			$('option:first', self).remove();					
		}
	}	
	
})(jQuery);
