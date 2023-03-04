<?php

interface IEntity
{
  /**
   * ID getter
   */
  public function getID();
  /**
   * id can be integer or an associtative array in case more than one id is required
   */
  public function setID($id): void;
  
  /**
   * Setters and getters
   */
  public function get(string $property);
  public function set(string $property, $value): void;

  /**
   * Method used to load object properties from database
   */
  public function load(array $properties): void;

  /**
   * Method gets a mapper object for the current object
   */
  public function getMapper();
  
  /**
   * Database syncronization management
   */
  public function inSync(): bool;
  public function setSync(bool $state): void;
}
