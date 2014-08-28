/*
 * File:        jquery.dependon.js
 * Version:     1.0.0
 * Author:      Thomas Champion <thchampi@gmail.com>
 * 
 * Plugin servant au remplissage de liste dépendant de la valeur sélectionnée
 * dans une autre liste.
 */
(function($) {	
	$.fn.dependOn = function(options) {
		var sup = this;
		var opts = $.extend({}, {
			selectOne : true,	// si un seul choix on le sélectionne
			values : {},		// table associative clé - valeurs, ex: { key : ["val1", "val2", "val3"] } ou selector sur un élément contenant un JSON
			mode : 'static',	// mode de recherche des valeurs : static, ajax, hierarchy
			url : "",			// url pour le mode ajax
			datatype : "json",	// datatype pour le mode ajax,
			defaultHtml : '<option value="">...</option>'
		}, options);
		
		/**
		 * Si values est une chaîne, on considère que c'est un selector
		 * et que les données sont stockés sous format JSON
		 */
		if (typeof opts.values == 'string') {
			var src = $q(opts.values);
			
			/*
			 * Check errors
			 */
			if (!src.length)
				throw "jquery.dependon: impossible de charger l'attribut values, l'élement '" + opts.values + "' n'existe pas."; 
			
			var json = src.text().trim();
			
			if (!json)
				throw "jquery.dependon: impossible de charger l'attribut values, l'élement '" + opts.values + "' ne contient aucune donnée.";
			
			try {
				opts.values = jQuery.parseJSON(json);
			} catch(e) {
				throw "jquery.dependon: impossible de charger l'attribut values, l'élement '" + opts.values + "' contient un JSON invalide.";
			}
		}
		
		this.each(function() {
			var self = $(this);
			var data = self.data();
			
			/**
			 * Rempli la liste de premier niveau qui n'a pas de dépendance 
			 */
			if (!data.dependon) {
				process(self, opts, null, true);
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
				process(self, opts, dependency);
				
				/*
				 * On force le déclenchement du process pour la liste courante
				 */
				self.change();
			}).change();
		});
	};
	
	$.extend($.fn.dependOn, {
		/**
		 * Ensemble des différentes modes de processing, le processor correspondant
		 * est utilisé en fonction du mode choisi dans les options. 
		 */
		processors : {
			'static' :  function(self, opts, dep, root) {
				render(self, opts, root ? opts.values : opts.values[dep.val()]);			
			},
			'ajax' : function(self, opts, dep, root) {
				var val = root ? null : dep.val();
				
				$.get(opts.url, { field : self.attr('name'), dependValue : val, root : root }, function(data) {
					render(self, opts, data);
				}, opts.datatype)
				.error(function(){
					render(self, opts, []);
				});
			},
			'hierarchy' : function(self, opts, dep, root) {
				var values = {},
					path = $.fn.dependOn.findPath(self),
					d = opts,
					data = self.data();
				
				/*
				 * si un path est trouvé on descend dans l'arbre de 
				 * données pour récupérer le noeud dont dépend self
				 */
				if (path) {
					var patht = path.split('.');

					$q.each(patht, function(index, elem) {
						if (!d.values) {
							d = null;
							return false;
						}
						
						d = d.values[elem];
						if (!d)
							return false;
					});										
				}	
				
				/**
				 * self dépend d'un attribute
				 */
				if (data.dependonAttr) {
					/*
					 * si d est bien un noeud de l'arbre de données
					 * et non pas opts
					 */
					if (d && d.attributes)					
						values = [d.attributes[data.dependonAttr]];
				}
				/**
				 * self dépend des values du noeud
				 */
				else {
					/*
					 * génère la map de la liste déroulante à partir des données trouvées.
					 * Si la liste courante est la liste de premier niveau (root),
					 * alors on utilise la racine de l'arbre de données pour générer la liste.
					 */
					if ((path || root) && d && d.values) {
						$q.each(d.values, function(index, elem) {
							values[index] = elem.label || index;
						});
					}
				}
				
				render(self, opts, values);	
			}
		},
		
		/**
		 * Liste des différents render par type d'élement
		 */
		renders : {
			'select' : function(self, opts, values) {
				/*
				 * Reset le select
				 */		
				self.html(opts.defaultHtml);			
				
				if (!values)
					return;	
				
				var assoc = $.isPlainObject(values),
					selected = self.data('dependonValue');
				
				$.each(values, function(idx, elem) {
					var v = (assoc ? idx : elem);
					self.append('<option value="' + v + '"' + (selected == v ? ' selected="selected"':'') +'>' + elem + '</option>');
				});	
				
				/*
				 * Un seul élément donc on le sélectionne
				 */
				if (opts.selectOne && self[0].length == 2) {
					self[0].selectedIndex = 1;
					$('option:first', self).remove();					
				}
			},
			'input' : function(self, opts, values) {
				/*
				 * Reset le select
				 */		
				self.val('');			
				
				if (!values)
					return;	
				
				var assoc = $.isPlainObject(values);
				var value = [];
				
				$.each(values, function(idx, elem) {
					value.push((assoc ? idx : elem));
				});	
				
				self.val(value.join(","));
			}
		},
	
		/**
		 * Résolution du path en se basant sur les dépendances.
		 * Le path correspond à l'ensemble des valeurs sélectionné
		 * dans les dépendences parentes récursives.
		 * @param self
		 * @returns
		 */
		findPath : function(self) {
			var dep = $q(self.data('dependon'));
			
			if (!dep.length)
				return null;
			
			var depPath = $.fn.dependOn.findPath(dep);
			
			if (depPath)
				return depPath + '.' + dep.val();
			
			return dep.val();
		}
	});	
	
	/**
	 * Remplissage du select avec la liste des valeurs
	 */	
	function render(self, opts, values) {
		var t = self.get(0).tagName.toLowerCase();
		
		$.fn.dependOn.renders[t](self, opts, values);
	}
		
	/**
	 * Récupère les valeurs pour la clé val et génère la liste
	 */
	function process(self, opts, val, root) {
		return $.fn.dependOn.processors[opts.mode](self, opts, val, root);			
	}
})(jQuery);