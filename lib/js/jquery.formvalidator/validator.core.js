/*********************************************
 * @name 		FormValidator
 * @version 	1.0
 * @author 		Thomas Champion (thchampi@gmail.com)
 * @description Validateur de formulaires
 * 
 * ##### Format du formulaire ######################
 * 
 * <form class="form_validator">
 * 		<div>
 * 			<input type="text" class="val_required" />
 * 		</div>
 * 		<div>
 * 			<input type="text" class="val_email" />
 * 		</div> 
 * </form>
 * 
 * ##### Ajout d'un validateur #####################
 * 
 * Création d'une fonction prend en paramétres :
 * 
 * @parma {jQuery} input Champ é valider.
 * @param {Event} event Evénement qui a déclancher la validation.
 * @return si la fonction retourne quelques choses, alors le champ
 * 			est considéré en erreur et le message retourné est affiché.
 * 
 * @example 
 * 
 * validators["ma_classe_css"] = function(input, event) {
 * 		if (input.val() == "")
 * 			return "Le champ ne doit pas étre vide";
 * }
 * 
 *********************************************/

/**
 * Classes CSS des différents éléments
 */
var classSubmitted = 'val_submitted';
var classError 		= 'form_error';				// classe mise sur le champ indiquant une erreur
var classValid 		= 'form_valid';				// classe mise sur le champ indiquant qu'il a été validé
var classFormVal 	= 'form_validator';			// classe indiquant qu'un formulaire doit étre validé
var classFormMsg	= 'form_global_message';	// classe de l'élément qui va contenir le message d'erreur {noticeFormHasErrors}
var classWaiting	= 'form_waiting';
var classBox		= 'box_validator';			// classe des box de validation de chaque champs
var classBoxError	= 'box_validator_error';	// indique é la box que le champ est en erreur
var classBoxValid	= 'box_validator_valid';	// indique é la box que le champ est validé
var classBoxBlock 	= 'box_validator_block';	// indique que la box est associé é élément de type block et non pas é un champ de formulaire
var boxBlockPosition = 'bottom';				// position de la box de validation dans un élément de type block (valeurs: top, bottom)
var classAsEmpty	= 'is_default_value';
var boxValidator	= '<div><span class="left"></span><span class="msg"></span><span class="right"></span></div>';
var boxValMsg		= 'msg';
var VAL_WAITING		= '__VAL_WAITING__';

/**
 * Messages
 */
var noticeFormHasErrors = 'Ce formulaire contient des erreurs : veuillez vérifier les champs.';

/**
 * Evénements pour lesquels la validation
 * est lancé pour un champ
 */
var valEvents 		= 'change keyup focusout';
var defaults        = {events: valEvents};

/**
 * Handlers d'événements 
 */
var formErrorHandler = formHasErrors; 	// au moment du check du formulaire des erreurs sont détectés
var formValidHandler = formIsValid;		// le formulaire est détécté comme n'ayant plus d'erreurs

/**
 * Liste des validateurs par défaut:
 * il est possible d'en rajouter, simplement 
 * en ajoutant un élément dans le tableau validators:
 * 
 * validators[classe_css] = fonction_du_validateur
 */ 
var validators = new Array();

/**
 * Initialisation du processus de validation :
 * branchement des écouteurs d'événements sur les champs é valider
 * ainsi que sur la soumission du formulaire
 */
$(function(){
	/**
	 * On branche chaque élément qui correspondant é un type
	 * de validateur aux différents événements de l'IHM
	 */	
	$('.'+classFormVal).formValidator();
	
	/**
	 * On déclenche l'événement {form_validator_ready} pour indiquer que le framework FormValidator est prét
	 */
	$().trigger('form_validator_ready');
});

$.fn.formValidator = function() {
    return this.each(function() {
        var form = $(this);
    
        /**
         * On branche chaque élément qui correspondant é un type
         * de validateur aux différents événements de l'IHM
         */
        initValidators(form);
        
        /**
         * Evenement de soumission du formulaire :
         * on effectue une validation globale
         */    
        form.bind('submit',function(event) {
            var form = $(this);
            
            /**
             * 
             */
            if (!form.hasClass(classSubmitted))
                checkForm(form, event);
            
            var errors = form.find('.'+classError).length;
            var waitings = form.find('.'+classWaiting).length;
            
            if (!errors)
                form.addClass(classSubmitted);
            else
                form.removeClass(classSubmitted);
            
            /**
             * S'il reste des erreurs on ne valide pas le formulaire
             */
            if (errors || waitings) {                
                event.stopImmediatePropagation();
                
                if (errors && typeof(formErrorHandler) == 'function')
                    formErrorHandler(form);
                    
                return false;
            /*} else if (form.find('.'+classWaiting).length > 0) {
form.data('submit-waiting', 'true');
                        event.stopImmediatePropagation();
                        return false;*/
            } else {                
                /**
                 * On vide tous les champs qui ont leur "valeur par défaut"
                 */
                $(this).find('.is_default_value').val('');
            }
        }); 
    });
};

/**
 * On branche chaque élément qui correspondant é un type
 * de validateur aux différents événements de l'IHM
 */
function initValidators(parent) {
	for (key in validators)
		bindValidator(key, parent);
}

/**
 * Rebranche les évènements de validation liés aux classes définis
 * par l'objet à valider.
 * @param {jQuery}
 */
/*function initValidator(input) {
	var classes = input.attr('class').split(' ');
	var hasvalidation = false;
	
	for (idx in classes)
		if (validators[classes[idx]] != undefined)
			hasvalidation = true;
	
	if (hasvalidation)	
		bindInput(input);
}*/

/**
 * Bind la classe clazz passé en paramétre aux événements de validation
 * @param selector
 */
function bindValidator(clazz, parent) {
    var cfg = getConfig(clazz);
    
    parent.delegate('.' + classError, defaults.events, validAction);
    parent.delegate('.' + clazz, cfg.events, validAction);
}

/**
 * Get config
 * @return Validator 
 */
function getConfig(valname) {
    var validator = validators[valname];
    
    if (typeof validator == 'function')
        validator = {fun : validator};
        
    if (validator.events)
        validator.events = validator.events.replace(/blur/, 'focusout');
    
    return $.extend({}, defaults, validator);
}

/**
 * Bind input for validation
 * @param {jQuery}
 */
/*function bindInput(input, cfg) { 
    var e = cfg && cfg.events || defaults.events;
    input.bind(e, validAction);
}*/

function validAction(event) {
    /*
     * On ignore les tabulations
     */
    if (event.type == 'keyup' && event.keyCode == 9)
        return;
        
    /*
     * On exécute la validation pour le champ courant
     */
    validate($(this), event);   
}

/**
 * Lance la validation sur l'ensemble des champs du formulaire form
 * qui ont indiqué un type de validateur (val_required, val_email...)
 * @param jQuery form
 */
function checkForm(form, event) {
	for (key in validators)
		form.find('.'+key).each(function() {
			validate($(this), event);	
		});
}

/**
 * Fonction appelée si, lors de la soumission du formulaire,
 * il existe des erreurs.
 * Il est tout é fait possible de la surcharger pour changer son 
 * comportement.
 */
function formHasErrors(form) {
	form.find('.' + classFormMsg)
	.text(noticeFormHasErrors)
	.slideDown('slow');
}

function formIsValid(form) {
	form.find('.' + classFormMsg)
	.text('')
	.slideUp('slow');
}

/**
 * Test si des erreurs ont été déclarée, 
 * s'il n'y en a pas alors, le message global d'erreur est supprimé.
 * 
 * @param jQuery form
 */
function checkIfFormValid(form) {
	if (form.find('.'+ classError).length == 0)
		formValidHandler(form);
}

/**
 * Lance la validation sur le champ input
 * @param jQuery input
 * @param Event event
 */
function validate(input, event) {
    /*
     * Champ en cours de validation asynchrone
     */
    if (isWaiting(input))
        return;
    
	/*
	 * On cherche le type de validateur
	 */
	var classes = input[0].className.split(/ /);
	var ret;
	var valComplete = true;
	
	for (c in classes) {
		if (isFormField(input) && !isRequired(input) && isEmpty(input))
			continue;
		
		if (validators[classes[c]] != undefined) {
			ret = callValidator(classes[c], input, event);
			
			
			if (ret == VAL_WAITING)
				valComplete = false;
			else if (ret != undefined) {
				setInputError(input, ret);
				return;
			}
		}
	}
	
	if (valComplete)
		setInputValid(input);
	else
		setInputWaiting(input);
	
	/*
	 * Supprime le message global indiquant qu'il y a des erreurs,
	 * s'il n'y en a plus
	 */
	
	checkIfFormValid(input.closest('form'));
}

function callValidator(name, input, event) {
    var val = getConfig(name);
    
    if ($.inArray(event.type, val.events.split(' ')) != -1 
        || event.type == 'submit'
        || input.is('.'+classError))
    return val.fun(input, event);
}

/****
 * Valide les champs obligatoires
 ****/

validators["val_required"] 	= {events: 'blur focusout', fun: validatorRequired};

function validatorRequired(input) {
	if (!isFormField(input))
		input = input.find(formElem);
	
	if (isEmpty(input))
		return 'Champ obligatoire';
}

/*********************************************
 * Outils
 *********************************************/

/**
 * Ajout d'un validateur avec la class css {clazz}
 */
function addValidator(clazz, fct) {
	if (typeof(fct) != 'function')
		return false;
	
	validators[clazz] = fct;
	bindValidator(clazz);
}

var formElem = 'input, textarea, select';

/**
 * Détermine si l'objet passé en paramétre est un champ de formulaire
 */
function isFormField(input) {
	return input.is(formElem);
}

/**
 * Détermine si le champ est vide
 * @param {jQuery}
 * @return {boolean}
 */
function isEmpty(input) {
	return input.val() == '' || input.is('.is_default_value');
}

/**
 * Détermine si un champ est requis
 */
function isRequired(input) {
	return input.is('.val_required');
}

/**
 * Détermine si l'argument adresse est une adresse e-mail valide
 * @param string adresse
 */

function isEmail(adresse) {
	if (adresse == "") return false;	
	
	var at = adresse.indexOf("@",1);
	var point = adresse.indexOf(".",at+1);

	return (at > -1) // @ présent
			&& (adresse.length > 5)  // taille de l'email supérieur é 2 caractéres => a@a.fr (email minimum)
			&& point > 1
			&& point != (at+1) // le point ne doit pas suivre l'arobase
			&& point < adresse.length-2; // il doit y avoir au moins 2 caractéres aprés le dernier point
}

/**
 * Détermine si le champ est dans l'état "posséde une erreur"
 * @param {jQuery} input
 * @return {Boolen}
 */
function isError(input) {
	return input.hasClass(classError) || input.parents('.'+classError).length > 0;
}

/**
 * Détermine si le champ est dans l'état "validé".
 * Le fait que cette fonction retourne retourne false, 
 * ne veut pas dire que le champ est dans l'état "erreur",
 * mais simplement que le champ n'a pas terminé l'étape de
 * validation ou alors n'est pas un champ avec une propriété 
 * é valider.
 * @param {jQuery} input
 * @return {Boolen}
 */
function isValid(input) {
	return input.hasClass(classValid) || input.parents('.'+classValid).length > 0;
}

function isWaiting(input) {
    return input.is('.' + classWaiting);
}

/**
 * Retourne le message d'erreur courant pour le champ input
 * s'il en existe un, une chaéne vide sinon.
 * @param {jQuery} input
 * @return {String}
 */
function getError(input) {
	return input.attr('title');
//	var box = input.find('.' + classBox);
//	
//	if (box.length != 1) return '';
//	
//	return box.text();
}

/*********************************************
 * Validation des formulaires
 *********************************************/

/**
 * Calcul le statut de l'input à partir de "msg".
 * Si msg est vide c'est qu'il n'y a pas d'erreur, l'input passe à l'état "valid",
 * sinon msg est un message d'erreur, alors l'input passe à l'état "error".
 * 
 * @param jQuery input
 * @param string msg
 */
function setInputState(input, msg) {
	if (msg == undefined || msg == '')
		setInputValid(input);
	else
		setInputError(input, msg);
}

function setInputWaitingEnd(input, msg) {
    var form = input.closest('form');
    
    input.removeClass(classWaiting);
    setInputState(input, msg);
    
    if (form.hasClass(classSubmitted))
        form.submit();
}

/**
 * Indique que le champ input est valide
 * @param jQuery input
 */
function setInputValid(input){
	setInputAttr(input, '', classValid, classError);
}

inputValidHandler = setInputValid;

/**
 * Indique que le champ input contient une erreur
 * @param jQuery input
 * @param string errormsg
 */
function setInputError(input, errormsg) {
	setInputAttr(input, errormsg, classError, classValid);
}

inputErrorHandler = setInputError;

/**
 * Indique que le champ est en attente de validation 
 * (tâches asynchrones en cours)
 * @param jQuery input
 */
function setInputWaiting(input) {
	setInputAttr(input, '', classWaiting, classError + ' ' + classValid);
}

/**
 * Détermine l'état du champ input:
 * - ajoute les classes addclass, supprime les classes removeclass é l'élement {parent}
 * - ajoute la box de validation qui affiche le message d'erreur {msg} s'il y a une erreur, sinon l'affiche vide.
 * 
 * @param jQuery input
 * @param string msg
 * @param string addclass
 * @param string removeclass
 */
function setInputAttr(input, msg, addclass, removeclass) {
	input.addClass(addclass);
	input.removeClass(removeclass);
	
	/*
	 * Si la box n'existe pas on la créé 
	 */
	
	var isField = isFormField(input);
	var box = 'initiliaz';
    var left = input.is('.box-left');

	if (isField) {
		box = input.parent().find('.' + classBox);
		if (box.length == 0) {
			box = left ? $(boxValidator).insertBefore(input)
			         : $(boxValidator).insertAfter(input); // A cété pour les input, textarea, select
	     }
	       
	} else {
		box = input.find('>.' + classBox);
		if (box.length == 0)
			switch (boxBlockPosition) {
				case 'top' : box = $(boxValidator).prependTo(input); break;
				case 'bottom' : box = $(boxValidator).appendTo(input); break;
			}
	}
			
	/*
	 * Si message d'erreur présent on l'affiche à coté du champ
	 */	
	//input.attr('title', msg);
	box.attr('class', classBox + ' ' + (msg == '' ? classBoxValid : classBoxError) + (!isField ? ' ' + classBoxBlock : ''));
	box.find('.'+boxValMsg).text(msg);
	
	if (left) box.addClass('left');
	
	/*
	 * Box Adjust
	 */
	boxAdjust(box);
}

function boxAdjust(box) {
	var w = (-parseInt(box.width()) + 10) + 'px';
	var dir = box.is('.left') ? 'left' : 'right';
	box.css(dir, w);		
}

$(function() {
	/*$('.'+classBox).each(function() {
		boxAdjust($(this));		
	});*/
});
