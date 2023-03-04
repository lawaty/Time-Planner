<?php

/**
 * @property string $mapper_type
 */
abstract class Entity implements IEntity
{
  protected ?IMapper $mapper = null; // mapper instance
  protected bool $synced = true; // db synchronization flag

  protected array $ids = [
    'id' => null
  ];

  public function copy(IEntity $entity): void
  {
    /**
     * copy properties from another entity
     */
    if (get_class($entity) != static::class)
      throw new IncompatibleEntities(static::class, get_class($entity));

    $fields = get_object_vars($this);
    foreach($fields as $field => $value)
      $this->{$field} = $entity->get($field);
    
  }

  public function __construct($id)
  {
    $this->setID($id);
    $this->inSync();
  }

  public function load(array $data): void
  {
    /**
     * Method used to load ALL required user properties and optional if found
     * @param array data to be loaded including required and optional info
     */

    foreach ($data as $property => $value)
      if (property_exists($this, $property))
        $this->set($property, $value);
  }

  public function getID(): array
  {
    /**
     * Function returns the entity id
     */
    return $this->ids;
  }

  public function setID($id): void
  {
    /**
     * Method receives integer id or an associtative array of ids in case more than one id is required for this entity
     */

    if (!is_array($id)) {
      $this->ids['id'] = $id;
      return;
    }

    foreach ($this->ids as $key => $value) {
      if (!key_exists($key, $id))
        throw new RequiredPropertyNotFound($key, static::class);

      if ($id[$key] <= 0)
        throw new InvalidID(static::class, $key);

      $this->ids[$key] = intval($id[$key]);
    }
  }

  public function get(string $property)
  {
    if (!property_exists($this, $property) && !isset($this->ids[$property]))
      throw new PropertyNotExisting($property, static::class);

    if (isset($this->ids[$property]))
      return $this->ids[$property];

    if (!isset($this->{$property}))
      $this->copy($this->getMapper()->get($this->getID()));

    return $this->{$property};
  }

  public function set(string $property, $value): void
  {
    if (isset($this->ids[$property]))
      return;

    if (!property_exists($this, $property))
      throw new PropertyNotExisting($property, static::class);

    if (is_float($value))
      $value = floatval($value);

    else if (is_numeric($value))
      $value = intval($value);

    else if (isJson($value))
      $value = json_decode($value, true);

    if (!isset($this->{$property}) || $this->{$property} != $value) {
      $this->{$property} = $value;
      $this->setSync(false);
    }
  }

  public function getMapper(): IMapper
  {
    if (!$this->mapper)
      $this->mapper = new static::$mapper_type($this);

    return $this->mapper;
  }

  public function inSync(): bool
  {
    /**
     * Method checks the object synchronization with database
     */
    return $this->synced;
  }

  public function setSync(bool $state): void
  {
    $this->synced = $state;
  }
}
