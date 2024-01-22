<?php

class Edit extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'session_id' => [true, Regex::ID],
      'description' => [false, Regex::generic(0, 255)],
      'date' => [false, Regex::DATE],
      'time' => [false, Regex::TIME_SEC],
      'project_id' => [false, Regex::ID]
    ], $_POST);
  }

  public function handle(): Response
  {
    if(count($this->request) < 2)
      throw new BadRequest("Nothing To Change");

    if(!$session = SessionMapper::getByUser($this->user, ['id' => $this->request['session_id']]))
      throw new NotFound("Session");

    unset($this->request['session_id']);
    foreach($this->request as $key => $value)
      $session->set($key, $value);
    
    try{
      $session->getMapper()->save();
      return new Response(SUCCESS);
    }
    catch(ForeignKeyViolated $e) {
      throw new NotFound("Project");
    }
    catch(Exception $e) {
      throw new Fail;
    }
  }
}