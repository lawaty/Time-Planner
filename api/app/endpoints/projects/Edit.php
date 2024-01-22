<?php

class Edit extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'project_id' => [true, Regex::ID],
      'name' => [false, Regex::NAME],
      'color' => [false, Regex::HEX]
    ], $_POST);
  }

  public function handle(): Response
  {
    if (count($this->request) < 2)
      throw new BadRequest("Nothing To Change");

    if (!$project = ProjectMapper::getByUser($this->user, ['id' => $this->request['project_id']]))
      throw new NotFound("Project");

    unset($this->request['project_id']);
    foreach ($this->request as $key => $value)
      $project->set($key, $value);

    try {
      $project->getMapper()->save();
      return new Response(SUCCESS);
    } catch (Exception $e) {
      throw new Fail;
    }
  }
}
