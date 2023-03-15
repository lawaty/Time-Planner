<?php

class Create extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'time' => [true, Regex::TIME_SEC],
      'description' => [false, Regex::generic(0, 255)],
      'project_id' => [true, Regex::ID]
    ], $_POST);
  }

  public function handle(): Response
  {
    try {
      if ($session = SessionMapper::create([
        ...$this->request,
        'date' => Ndate::now()
      ]))
        return new Response(SUCCESS, $session->get('id'));

      throw new Fail();
    } catch (ForeignKeyViolated $e) {
      throw new NotFound("Project");
    }
  }
}
