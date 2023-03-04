<?php

class Delete extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'session_id' => [true, Regex::ID]
    ], $_POST);
  }

  public function handle(): Response
  {
    if(!$session = SessionMapper::getByUser($this->user, ['sessions.id' => $this->request['session_id']]))
      throw new NotFound("Session");
    
    return new Response(SUCCESS, $session->getMapper()->delete());
  }
}