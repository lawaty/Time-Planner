// Interface
class Form {
  static new(form){
    let type = $(form).attr('form_type')
    switch(type){
      case 'basic':
        return new BasicForm(form)
      case 'editable':
        return new EditableForm(form)
      default: 
        throw "Form Creation Error: Unknown form type.\nAvailable types are basic, editable, and list\nTrace <form id='"+$(form).attr('id')+"'>"
    }
  }
}

initializeForms = function(){
  let forms = []
	$("form[form_type]").each(function(i, form){
    if($(form)[0].hasAttribute('prepare')){
      let prepare = window[$(form).attr('prepare')];
      if(typeof prepare == 'function')
        prepare()
      else console.log('Prepare Function Specified but Not Defined')
    }
		forms[$(form).attr('id')] = Form.new(form)
	});
  return forms
}

// Form Types
class BasicForm {
	/**
	 * class for basic form flow (validation, data extraction, and ajax requesting)
	 */
	constructor(form){
		/**
		 * Form Initialization.
		*/
		this.form = form
    this.form_title = $(form).attr('id')
    if(this.form_title === undefined)
      console.log("id not found for "+this.form_title+" form")

    this.initialize()
	}

  initialize(){
    if($(this.form).attr('form_type') != 'list')
		  this.validators = new Validators(this.form)
		this.sender = new Sender(this.form)

		this.submitBtn = $("[submit="+$(this.form).attr('id')+"]")
    if(!this.submitBtn.length)
      console.log("submit btn not found for "+this.title+" form")
		$(this.submitBtn).attr('type', 'button')
		$(this.submitBtn).click(this.run.bind(this))
  }

  payload(){
    return new FormData(this.form[0])
  }

	run() {
		/**
		 * run the form
		 */
		if(this.validators.validateAll()){
      let form_data = this.payload()
      this.sender.send(form_data)
    }
	}
}

class EditableForm extends BasicForm {
  /**
   * Tracks changes to existing fields and identifies changes (handles file inputs)
   */
  constructor(form){
    super(form)
    this.toggler = new ToggleableForm(form)
    this.update()
  }

  update(){
    /**
     * update this.originals
     */
    this.originals = []
    $(this.form).find("[name]:not([essential])").each(function(i, input){
      let key = $(input).attr('name');
      let value;
      if($(input).attr('type') == 'file') // tracking file
        value = $(input).attr('file')
        
      else
        value = $(input).val()
      this.originals[key] = value
      
    }.bind(this))
    
    this.toggler.originals = this.originals
    this.toggler.disable()
  }
  
  payload(){
    /**
     * return changed fields
     */
    let form_data = new FormData()

    $(this.form).find('[name]').each(function(i, input){
      let key = $(input).attr('name')
      let val
      if($(input).attr('type') == 'file')
        val = $(input).attr('file')
      else 
        val = $(input).val()
      
      if(val != this.originals[key]){
        val = $(input).attr('type') == 'file' ? $(input)[0].files[0] : val
        form_data.append(key, val)
      }
    }.bind(this))

    return form_data
  }
}

// Utilities
class Sender {
  /**
   * Class for form-api communication
   */
  constructor(form){
		this.form = form
		this.form_title = $(form).attr('id')
		this.api = $(form).attr('api')
		if(this.api === undefined)
			console.log("api destination not found for "+this.form_title+" form")
		this.type = $(form).attr('request_type') !== undefined ? $(form).attr('request_type') : 'GET'
		this.callback = window[$(form).attr('callback')]
		if(this.callback === undefined)
			console.log("callback function not determined for "+this.form_title+" form")
	}

  send(data){
		AJAX.ajax({
			url: this.api,
			type: this.type,
			data: data,
			complete: function(xhr){
        if(typeof(this.callback) == "function")
				  this.callback(xhr)
			}.bind(this)
		})
  }
}

class ToggleableForm {
  /**
   * Editable Form that tracks filled data and extracts changes made to it then sends it to the back-end
   */
  constructor(form){
		/**
		 * Form Initialization
		*/
		this.form = form
    this.type = $(form).attr('form_type')
    this.title = $(this.form).attr('id')

    // Toggling belongings
    this.decision = $(this.form).find('[decision]')
    if(!this.decision.length)
      console.log("decision container not found for "+this.title+" form")

    this.enableBtn = $(this.form).find('[enable]')
    if(!this.enableBtn.length)
      console.log("Enable Form btn not found for "+this.title+" form")
    $(this.enableBtn).css("pointer-events", "auto")
    this.enableBtn.click(this.enable.bind(this))

    this.disableBtn = $(this.form).find('[disable]')
    if(!this.disableBtn.length)
      console.log("Disable form btn not found for "+this.title+" form")
    $(this.disableBtn).css("pointer-events", "auto")
    this.disableBtn.click(this.disable.bind(this))  
  }

  enable(){
    /**
     * Hide Decision
     * Remove Disabled Attributes
     * Update toggleBtn
     */
    $(this.decision).addClass('hidden');

    // Enabling editable forms
    $(this.form).find('[name]').each(function(i, input){
      $(input).removeAttr('disabled')
      if($(input).attr('type') == 'file')
        $(input).next().removeAttr('disabled')
    })

    // Enabling list forms
    if(this.type == 'list'){
      for(let list of this.lists)
        list.showActions()
    }
      
    this.enableBtn.addClass("hidden")
    this.disableBtn.removeClass("hidden")
    this.enabled = true  
  }

  isChanged(){
    let changed = false

    if(this.type == 'editable'){
      $(this.form).find('[name]:not([essential])').each(function(i, input){
        let original = this.originals[$(input).attr('name')]
        let val
        if($(input).attr('type') == 'file'){
          let name = $(input).attr('name')
          val = $("[track="+name+"]").html()
        }
        else
          val = $(input).val()
  
        if(original != val) {
          changed = true
          return false; // Exit Loop
        }
      }.bind(this));
    }
    else if(this.type == 'list'){
      for(let list of this.lists)
        if(list.isChanged()){
          changed = true
          break;
        }
    }

    return changed
  }

  disable(){
    /**
     * Disable editing
     */
    if(this.isChanged()) // payload() is implemented in the subclasses
      $(this.decision).removeClass('hidden');
    else
      $(this.decision).addClass('hidden'); 

    // Disabling editable forms
    $(this.form).find('[name]').each(function(i, input){
      $(input).attr('disabled', 'disabled')
      if($(input).attr('type') == 'file')
        $(input).next().attr('disabled', 'disabled')
    })

    // Disabling list forms
    if(this.type == 'list'){
      for(let list of this.lists)
        list.hideActions()
    }

    this.enableBtn.removeClass("hidden")
    this.disableBtn.addClass("hidden")
    this.enabled = false
  } 
}