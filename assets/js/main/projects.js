import { listSessions } from "./sessions.js";
import { listGoals, listWeeklyGoals } from "./goals.js";

syncManager.registerType('project', ['id', 'name', 'color'])

$(document).on('project-added', function (e, project) {
  $("#no-projects").hide()

  // Add to sidebar list
  $("ul[observe=project]").append(`
    <li style="color:${project.color}" data-id="${project.id}" id="project-${project.id}">${project.name}<i class="bi bi-trash" onclick="deleteProject($(this).parent().attr('id').split('-')[1])"></i></li>
  `)

  // Add to all select project dropdowns
  $("select[observe=project]").append(`
    <option style="color:${project.color}" data-id="${project.id}" value="${project.id}">${project.name}</option>
  `)
})

$(document).on('project-removed', function (e, removed) {
  // Remove from all observers
  $(`[observe=project] [data-id=${removed.id}]`).remove()

  // Remove all associated resources
  $("[data-name=project_name]").each(function (i, container) {
    if ($(container).html() == removed.name) {
      let resource = $(container).closest("[data-id]")
      syncManager.remove(`${$(resource).attr('observe')}`)
    }
  })
})

$(document).on('project-empty', function () { $("#no-projects").show() })

// AJAX for creating new project
let new_project_form = new BasicForm($("#new_project_form"))
new_project_form.setCallback(function (xhr) {
  switch (xhr.status) {
    case 200:
      let project = {
        id: xhr.responseText,
        color: new_project_form.get('color'),
        name: new_project_form.get('name')
      }

      syncManager.add('project', project)

      $("#new-project-modal").modal('hide')
      break;

    case 409:
      if (xhr.responseText.includes("color"))
        alert("project color already selected for another project")
      else if (xhr.responseText.includes("name"))
        alert("project name already exists for another project")
      break;

    default:
      alert("Couldn't create project")
  }
})

function deleteProject(project_id) {
  if (confirm("Are you sure you want to delete this project ?")) {
    AJAX.ajax({
      url: "api/projects/delete",
      type: "POST",
      data: {
        token: local.get('token'),
        project_id: project_id
      },
      complete: function (xhr) {
        switch (xhr.status) {
          case 200:
          case 204:
            syncManager.remove('project', project_id)
            break;

          default:
            alert("Something went wrong. Please, reload")
        }
      }
    })
  }
}

window.deleteProject = deleteProject

function listProjects() {
  AJAX.ajax({
    url: "api/projects",
    type: "GET",
    data: {
      token: local.get('token')
    },
    complete: function (xhr) {
      switch (xhr.status) {
        case 200:
          for (let project of xhr.parsed)
            syncManager.add('project', project)

          listSessions()
          listGoals()
          listWeeklyGoals();
          break;

        case 204:
          break;

        default:
          alert('Cannot list projects. Please, reload')
      }
    }
  })
}

export { deleteProject, listProjects }