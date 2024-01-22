syncManager.registerType('session', ['id', 'date', 'time', 'description', 'project_id'])

$(document).on('session-added', function (e, session) {
  $("#no-sessions").hide();

  // Specify group to add this session to it
  let session_date = new Ndate(session.date)
  let description = session.description != null ? session.description : 'no description';

  let diff = session_date.diff(new Ndate())
  let title
  if (diff.days == 0)
    title = 'Today';
  else if (diff.days == 1)
    title = 'Yesterday';
  else
    title = `${diff.days} days ago`;

  // Create new group to add this session if not exists
  if (!$(`div[observe=session] div#sessions-${session_date.toString()}`).length)
    $(`div[observe=session]`).prepend(`
      <div class="px-4 pt-4 mb-3 sessions-group" id="sessions-${session_date.toString()}">
        <p class="d-flex justify-content-between">${title}<span data="total">00:00:00</span></p>
        <div data="list"></div>
      </div>
    `)

  // Add session to the right group
  $(`div[observe=session] div#sessions-${session_date.toString()} [data=list]`).prepend(`
    <div class="card mb-4" data-id="${session.id}" id="session-${session.id}">
      <div class="card-header d-flex justify-content-between" style="color:${syncManager.get('project', session.project_id).color}">
        <span data-name="project_name">${syncManager.get('project', session.project_id).name}</span>
        <i class="bi bi-trash" onclick="deleteSession($(this).closest('.card').attr('id').split('-')[1])"></i>
      </div>

      <div class="card-body">
        <p class="card-title text-center">
          ${session.time}
        </p>
        <p class="card-text d-flex justify-content-between text-secondary"><span>${description}</span><span class="date">${session.date}</span></p>
      </div>
    </div>
  `)

  let total_displayed = NInterval.fromClock($(`div[observe=session] div#sessions-${session_date.toString()} [data=total]`).html())

  let new_total_in_secs = total_displayed.total('secs') + NInterval.fromClock(session.time).total('secs')

  let new_total = new NInterval({ secs: new_total_in_secs })
  $(`div[observe=session] div#sessions-${session_date.toString()} [data=total]`).html(new_total.formatClock())
})

$(document).on('session-removed', function (e, session) {
  // Remove session from all observers
  $(`[observe=session] [data-id=${session.id}]`).remove()

  // Remove group if this was the only session existing in it
  if (!$(`div#sessions-${session.date} div`).length)
    $(`div#sessions-${session.date}`).remove()

  let total_displayed = NInterval.fromClock($(`div[observe=session] div#sessions-${session_date.toString()} [data=total]`).html())

  let new_total_in_secs = total_displayed.total('secs') - NInterval.fromClock(session.time).total('secs')

  let new_total = new NInterval({ secs: new_total_in_secs })
  $(`div[observe=session] div#sessions-${session_date.toString()} [data=total]`).html(new_total.formatClock())
})

$(document).on('session-empty', function () { $("#no-sessions").show() })

$(document).on('project-removed', function (e, project) {
  let sessions = syncManager.session
  for (let id in sessions)
    if (sessions[id].project_id == project.id)
      syncManager.remove('session', id)
})


// new session ajax
let new_session_form = new BasicForm($("#new_session_form"))
new_session_form.setCallback(function (xhr) {
  switch (xhr.status) {
    case 200:
      let project = syncManager.get('project', new_session_form.get('project_id'))
      let session = {
        id: xhr.responseText,
        project_id: project.id,
        project_name: project.name,
        color: project.color,
        time: new_session_form.get('time'),
        description: new_session_form.get('description'),
        date: new_session_form.get('date')
      }

      syncManager.add('session', session)

      save()
      $("#new-session-modal").modal('hide')
      break;

    default:
      alert("Something went wrong, please refresh")
  }
})

// Timer Flow
class Timer extends NInterval {
  constructor(container = null) {
    super({ secs: 0 })
    this.container = container
    this.started = false;
    this.localSaver = null;

    this.tic = new Audio('assets/sound/tic-tac.mp3')

    this.motives = [
      new Audio('assets/sound/motivation1.mp3'),
      new Audio('assets/sound/motivation2.mp3'),
      new Audio('assets/sound/motivation3.mp3'),
    ]

    this.setupSound()
  }

  setupSound() {
    this.volume = 0.3
    this.muted = false

    this.setVolume(this.volume)
  }

  run() {
    this.secs++
    this.tic.play()

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
    $(this.container).html(this.formatClock())
  }

  start() {
    if (!this.started) {
      this.interval = setInterval(function () { this.run() }.bind(this), 1000)
      this.localSaver = setInterval(function() {
        local.set('draft', JSON.stringify({
          'project': $("#session-project_id option:selected").html(),
          'project_id': $("#session-project_id").val(),
          'time': this.formatClock()
        }))
      }.bind(this), 10 * 1000)
      this.started = true;
    }

    this.motivation = setInterval(function () {
      this.motives[getRandomInt(0, 2)].play()
    }.bind(this), 900000)
  }

  pause() {
    clearInterval(this.interval);
    clearInterval(this.motivation)
    this.started = false;
  }

  reset() {
    clearInterval(this.interval)
    clearInterval(this.motivation)
    this.secs = 0
    this.mins = 0
    this.hrs = 0

    if (this.container)
      this.display()

    this.started = false;

    clearInterval(this.localSaver)
    local.remove('draft')
  }

  setVolume(volume) {
    this.tic.volume = volume
    for (let motive of this.motives)
      motive.volume = volume
  }

  toggleMute() {
    this.muted = !this.muted
    this.tic.muted = this.muted
    for (let motive of this.motives)
      motive.muted = this.muted
  }
}

window.session_timer = new Timer($("#timer"))
function start() {
  session_timer.start()
  $("#start-btn").hide()
  $("#pause-btn").show()
  $("#reset-btn").removeAttr('disabled')
  $("#end-btn").removeAttr('disabled')
}

function pause() {
  session_timer.pause()
  $("#start-btn").html('Resume').show()
  $("#pause-btn").hide()
}

function end() {
  pause()
  $("#new-session-modal").modal('show')
  new_session_form.set('time', session_timer.formatClock())
  new_session_form.set('project_id', $("#session-project_id").val())
}

function save() {
  session_timer.reset()
  $("#start-btn").html('Start').show()
  $("#pause-btn").hide()
  $("#reset-btn").attr('disabled', 'disabled')
  $("#end-btn").attr('disabled', 'disabled')
}

function reset() {
  if(confirm("You won't be able to restore the unsaved session")){
    session_timer.reset()
    $("#start-btn").html('Start').show()
    $("#pause-btn").hide()
    $("#reset-btn").attr('disabled', 'disabled')
    $("#end-btn").attr('disabled', 'disabled')
  }
}

$("#start-btn").click(start)
$("#pause-btn").click(pause)
$("#end-btn").click(end)
$("#reset-btn").click(reset)

function deleteSession(session_id) {
  if (confirm("Are you sure you want to delete this session ?")) {
    AJAX.ajax({
      url: "api/sessions/delete",
      type: "POST",
      data: {
        token: local.get('token'),
        session_id: session_id
      },
      complete: function (xhr) {
        switch (xhr.status) {
          case 200:
          case 204:
            syncManager.remove('session', session_id)
            break;

          default:
            alert("Something went wrong. Please, reload")
        }
      }
    })
  }
}

window.deleteSession = deleteSession


function listSessions() {
  AJAX.ajax({
    url: "api/sessions",
    type: "GET",
    data: {
      token: local.get('token')
    },
    complete: function (xhr) {
      switch (xhr.status) {
        case 200:
          for (let session of xhr.parsed)
            syncManager.add('session', session)

          break;

        case 204:
          break;

        default:
          alert('Cannot list projects. Please, reload')
      }
    }
  })
}

export { listSessions }