syncManager.registerType('project', ['id', 'name', 'color'])

document.addEventListener('project-added', function (e) {
  let project = e.added
  $("#no-projects").hide()

  $("ul[observe=projects]").append(`
    <li style="color:${project.color}" data-id="${project.id}" id="project-${project.id}">${project.name}<i class="bi bi-trash" onclick="deleteProject($(this).parent().attr('id').split('-')[1])"></i></li>
  `)

  $("select[observe=projects]").append(`
    <option style="color:${project.color}" data-id="${project.id}" value="${project.id}">${project.name}</option>
  `)
})

document.addEventListener('project-removed', function (e) {
  let project = e.removed
  $(`[observe=projects] [data-id=${project.id}]`).remove()
})

document.addEventListener('project-empty', function() {$("#no-projects").show()})

let new_project_form = Form.new($("#new_project_form"))
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
        alert("project name already e;xists for another project")
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

window.deleteProject = deleteProject;