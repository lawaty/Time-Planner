<?php

class Get extends Authenticated
{
  public function __construct()
  {
    $this->init([
      'last' => [false, Regex::ID]
    ], $_GET);
  }

  public function handle(): Response
  {
    if(!isset($this->request['last']))
      $this->request['last'] = null;
      
    return new Response(SUCCESS, SessionMapper::getLatestByUser($this->user, $this->request['last']));
  }
}