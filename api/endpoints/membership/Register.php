<?php

class Register extends Endpoint {
  public function __construct()
  {
    $this->init([
      'username' => [true, Regex::LOGIN],
      'password' => [true, Regex::LOGIN],
      'email' => [true, Regex::EMAIL]
    ], $_POST);
  }

  public function handle(): Response {
    try{
      if(UserMapper::create($this->request))
        return new Response(SUCCESS);
      
      return new Response(FAIL);
    }
    catch(UniquenessViolated $e) {
      throw new Conflict("Username or email already exists");
    }
  }
}
