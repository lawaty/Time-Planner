<?php

class Create extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'name' => [true, Regex::NAME],
      'color' => [true, Regex::HEX]
    ], $_POST);
  }

  public function handle(): Response
  {
    try{
      if($project = ProjectMapper::create([
        'name' => $this->request['name'],
        'color' => $this->request['color'],
        'user_id' => $this->user->get('id')
      ]))
        return new Response(SUCCESS, [
          'project_id' => $project->get('id')
        ]);

      return new Response(FAIL);
    }
    catch(UniquenessViolated $e) {
      throw new Conflict("Conflicting " . $e->getMessage());
    }
  }
}
