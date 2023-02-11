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
(function () {
  let page = window.location.pathname.split('/').pop()
  // Need to sign in
  if (page != 'membership' && page != 'membership.html' && (!local.get('token') || !local.get('id'))) {
    local.remove('token')
    local.remove('id')
    window.location = "membership";
  }

  // Already signed in
  if((page == 'membership' || page == 'membership.html') && local.get('token') && local.get('id')){
    window.location = "home"
  }
})()

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

  JWT: /^[\w-]*\.[\w-]*\.[\w-]*$/,
  LOGIN: /^[\p{Script=Arabic}\w\-. ]+$/gu,
  EMAIL: /^[\w_\-.]+@[\w]+\.[\w]+$/,
  NAME: /^[\p{Script=Arabic}a-zA-Z ]+$/gu,
  PHONE: /^\+?[0-9]+$/,
  GRADE: /^([1-9]|1[0-2])$/,

  // general
  GENERIC: /^[\p{Script=Arabic}\w_\-\)\(. +]+$/gu,
  ANY: /^.*$/,
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

  interval(date) {
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