<?php

class Delete extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'project_id' => [true, Regex::ID]
    ], $_POST);
  }

  public function handle(): Response
  {
    if(!$project = ProjectMapper::getByUser($this->user, ['id' => $this->request['project_id']]))
      throw new NotFound('Project');
    
    if(!$project->getMapper()->delete())
      throw new Fail();

    return new Response(SUCCESS);
  }
}