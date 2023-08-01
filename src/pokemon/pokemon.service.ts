import { Injectable, BadRequestException,InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()

export class PokemonService {
  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokenmonModel: Model<Pokemon>
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokenmonModel.create( createPokemonDto );
      return pokemon
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon : Pokemon;
    if( !isNaN(+term) ){
    pokemon = await this.pokenmonModel.findOne({ no: term });
    }

    // MongoID
    if( !pokemon && isValidObjectId( term ) ){
      pokemon = await this.pokenmonModel.findById( term );
    }

    // Name
    if(!pokemon){
      pokemon = await this.pokenmonModel.findOne({ name: term.toLocaleLowerCase().trim() })
    }

    if(!pokemon) throw new NotFoundException(`Pokemon with id, name or id "${term}" not found`)

    return pokemon
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );
    if( updatePokemonDto.name ){
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }
    try {
      await pokemon.updateOne( updatePokemonDto );
      return { ...pokemon.toJSON(), ...updatePokemonDto };

    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    /* const pokemon = await this.findOne( id );
    await pokemon.deleteOne() */

    /* const result = this.pokenmonModel.findByIdAndDelete( id )
    return result */
    const { deletedCount } = await this.pokenmonModel.deleteOne({ _id: id })
    if( deletedCount === 0 ) {
      throw new BadRequestException(`Pokemon with id "${ id }" not found`)
    }
  }

  private handleExceptions( error: any ) {
    if(error.code === 11000){
      throw new BadRequestException(`Pokemon exist in db ${ JSON.stringify(error.keyValue)}`)
    }
    console.log(error)
    throw new InternalServerErrorException(`Can't create Pokemon - check server logs` )
  }
}