let local = {
  get: function (key) {
    let result = localStorage.getItem(key)
    if (result !== null)
      return result
    return false
  },
  set: function (key, value) {
    localStorage.setItem(key, value)
  },
  remove: function (key) {
    localStorage.removeItem(key)
  }
};

class MissingInfo extends Error {
  constructor(type, missing, object) {
    super()
    this.name = 'MissingInfo'
    this.message = `'${missing}' is required for object of type '${type}'. Found in this object: ${JSON.stringify(object)}`
  }
}

let syncManager = {
  types: {},

  registerType: function (type, fields) {
    /**
     * @param string type
     * @param array<string> fields
     */
    this.types[type] = fields
    this[type] = {}
  },

  add: function (type, object, key = null) {
    if (key === null)
      key = object.id

    let healthy_object = {}
    for (let required of this.types[type]) {
      if (object[required] === undefined) {
        try {
          throw new MissingInfo(type, required, object)
        } catch (error) {
          console.warn(error.stack)
        }
      }

      healthy_object[required] = object[required]
    }

    let event = new Event(`${type}-added`)
    event.added = healthy_object
    document.dispatchEvent(event)

    this[type][key] = healthy_object
  },

  remove: function (type, key) {
    let event = new Event(`${type}-removed`)
    event.removed = this[type][key]
    document.dispatchEvent(event)
    delete this[type][key]

    if (this.isEmpty(type)) {
      let event = new Event(`${type}-empty`)
      document.dispatchEvent(event)
    }
  },

  get: function (type, key) {
    return this[type][key]
  },

  empty(type) {
    let iterable = this[type]
    for (let key in iterable)
      syncManager.remove(type, key)
  },

  isEmpty(type) {
    return Object.keys(this[type]).length == 0;
  }
}

const Regex = {
  // Identifiers
  INT: /^[0-9]+$/,
  SINT: /^-?[0-9]+$/,
  ZERO_ONE: /^[0-1]$/,

  // Dates
  MONTH: /^([1-9]|1[0-2])$/,
  DATE: /^(\d{4})-(\d{2})-(\d{2})$/,
  TIME: /^[0-9]{2}:[0-9]{2}$/,
  DATE_TIME: /^(\d{4})-(\d{2})-(\d{2}) [0-9]{2}:[0-9]{2}$/,
  DATE_TIME_SEC: /^(\d{4})-(\d{2})-(\d{2}) [0-9]{2}:[0-9]{2}:[0-9]{2}$/,
  DAY_TIME: /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat) [0-9]{2}:[0-9]{2}$/,

  // Special
  JWT: /^[\w-]*\.[\w-]*\.[\w-]*$/,
  LOGIN: /^[\p{Script=Arabic}\w\-. ]+$/gu,
  EMAIL: /^[\w_\-.]+@[\w]+\.[\w]+$/,
  NAME: /^[\p{Script=Arabic}\w ]+$/gu,
  PHONE: /^\+?[0-9]+$/,
  GRADE: /^([1-9]|1[0-2])$/,

  // general
  GENERIC: /^[\p{Script=Arabic}\w_\-\)\(. +]+$/gu,
  ANY: /^.*$/,
}

let page = window.location.pathname.split('/').pop()
// Need to sign in
if (page != 'membership' && page != 'membership.html' && (!local.get('token') || !local.get('id'))) {
  local.remove('token')
  local.remove('id')
  window.location = "membership";
}

// Already signed in
if ((page == 'membership' || page == 'membership.html') && local.get('token') && local.get('id')) {
  window.location = "home"
}

class Timer {
  constructor(container = null) {
    this.secs = 0
    this.mins = 0
    this.hrs = 0

    this.container = container

    this.started = false;
  }

  run() {
    this.secs++

    if (this.secs == 60) {
      this.secs = 0
      this.mins++

      if (this.mins == 60) {
        this.mins = 0
        this.hrs++
      }
    }

    if (this.container !== null)
      this.display()
  }

  display() {
    $(this.container).html(this.getTimer())
  }

  getTimer() {
    let hours = this.hrs < 10 ? '0' + this.hrs : this.hrs
    let minutes = this.mins < 10 ? '0' + this.mins : this.mins
    let seconds = this.secs < 10 ? '0' + this.secs : this.secs

    return `${hours}:${minutes}:${seconds}`
  }

  start() {
    if (!this.started) {
      this.interval = setInterval(function () { this.run() }.bind(this), 1000)
      this.started = true;
    }
  }

  pause() {
    clearInterval(this.interval);
    this.started = false;
  }

  reset() {
    clearInterval(this.interval)
    this.secs = 0
    this.mins = 0
    this.hrs = 0

    if (this.container)
      this.display()

    this.started = false;
  }
}

class Ndate extends Date {
  static weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']

  constructor(a, b, c) {
    switch (arguments.length) {
      case 0:
        super();
        break;
      case 1:
        super(a);
        break;
      case 2:
        super(a, b);
        break;
      case 3:
        super(a, b, c);
        break;
    }
  }

  addDays(num_of_days) {
    this.setDate(this.getDate() + num_of_days);
    return this;
  }

  addWeeks(num_of_weeks) {
    this.setDate(this.getDate() + num_of_weeks * 7);
    return this;
  }

  addMonths(num_of_months) {
    this.setMonth(this.getMonth() + num_of_months)
    this.setDate(1);
    return this;
  }

  toString() {
    const offset = this.getTimezoneOffset()
    let temp = new Ndate(this.getTime() - (offset * 60 * 1000))
    return temp.toISOString().split('T')[0]
  }

  diff(date) {
    /**
     * @param date:Ndate
     */

    return new NdateInterval(Math.abs(date - this))
  }

  firstDayOfMonth() {
    return new Ndate(this.getFullYear(), this.getMonth(), 1).getDay()
  }

  lastDayOfMonth() {
    return new Ndate(this.getFullYear(), this.getMonth() + 1, 0).getDate()
  }

  sameDate(date) {
    return date.getFullYear() == this.getFullYear() &&
      date.getMonth() == this.getMonth() &&
      date.getDate() == this.getDate();
  }
}

class NdateInterval {
  constructor(milliseconds) {
    this.total_millis = milliseconds;

    this.days = parseInt(milliseconds / 86400000);
    milliseconds -= this.days * 86400000;

    this.hours = parseInt(milliseconds / 3600000);
    milliseconds -= this.hours * 3600000;

    this.minutes = parseInt(milliseconds / 60000);
    milliseconds -= this.minutes * 60000;

    this.seconds = parseInt(milliseconds / 1000);

    this.milliseconds -= this.seconds * 1000;

    Object.preventExtensions()
  }
}