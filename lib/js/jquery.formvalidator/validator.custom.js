/*********************************************
 * @name 		FormValidator
 * @version 	1.0
 * @author 		Thomas Champion (thchampi@gmail.com)
 * @description Validateur de formulaires
 * 
 * Ce fichier contient les validateurs predefinis et customs 
 *********************************************/

/*********************************************
 * Validateurs par defaut
 *********************************************/

validators["val_checkboxrequired"] 	= validatorCheckboxRequired;
validators["val_email"] 			= {events: 'focusout blur', fun: validatorEmail};
validators["val_number"] 			= validatorNumber;

/****
 * Valide les Checkbox et Boutons radio
 ****/

function validatorCheckboxRequired(block) {
	var hasChecked = block.find('input:checked').length > 0;
	
	if (!hasChecked)
		return 'Vous devez cocher une des cases';
}

/****
 * Valide une adresse e-mail
 ****/

function validatorEmail(input) {	
	if (!isEmail(input.val()))
		return 'L\'e-mail saisi n\'est pas correct.';
}

/****
 * Force un champ � �tre un nombre
 ****/

function validatorNumber(input, event) {
	if (!input.val().match('^[0-9.,]*$'))
		return 'Ce champ doit contenir un nombre';
}

/*********************************************
 * Validateurs custom
 *********************************************/

validators["val_date"] 			= validatorDate;
validators["val_codepostal"] 	= validatorCodePostal;
validators["val_phone"] = validatorPhone;

/**
 * Verifie qu'un champ contient une date au format 'dd/mm/yy'
 * @param input
 * @returns {String}
 */
function validatorDate(input) {
	test = input.val().match(/^\d\d?\/\d\d?\/\d\d\d\d$/);
	if (!test) 
		return 'Date non valide';
}

/**
 * Verifie qu'un champ contient un code postal valide
 * @param input
 * @returns {String}
 */
function validatorCodePostal(input) {
	if (input.val().length != 5 || !input.val().match('^[0-9]+$'))
		return 'Code postal non valide';
}

function validatorPhone(input) {
if (input && !input.val().match(/^\+?[ 0-9_.-]*$/))
return 'Le numéro saisi n\'est pas correct.';
}


/**********************************************************************
 * Validation du l'e-mail : on vérifie qu'il n'existe pas déjà
 **********************************************************************/

/**
 * 
 * @param {jQuery} input
 */
validators["val_emailexiste"] = function(input, event) {
    /*
     * on valide le fait que ce soit un e-mail 
     */
    /*var ise = callValidator('val_email', input, event);
    if (ise != undefined)
        return ise;*/
        
    if (!isEmail(input.val()))
        return;     
        
    /*
     * Si c'est un e-mail correct, on vérifie 
     * qu'il existe
     */
    
    return checkUserData('email', input, 'Cet e-mail existe déjà.');
};

/**********************************************************************
 * Validation du pseudo
 **********************************************************************/

/**
 * 
 * @param {jQuery} input
 */
validators["val_nickname"] = function(input, event) {
    /*
     * on valide le fait que ce soit un e-mail 
     */
    var ise = callValidator('val_required', input, event);
    if (ise != undefined)
        return ise;
        
    return checkUserData('nickname', input, 'Ce pseudo existe déjà.');;
};