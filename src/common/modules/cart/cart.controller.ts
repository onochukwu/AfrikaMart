import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/role.decorator';

@Controller('api/cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('USER')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('items')
  addItem(@Req() req, @Body() body) {
    return this.cartService.addItem(
      req.user.sub,
      body.productId,
      body.quantity,
    );
  }

  @Get()
  viewCart(@Req() req) {
    return this.cartService.viewCart(req.user.sub);
  }

  @Patch('items/:id')
  updateItem(
    @Req() req,
    @Param('id') id: string,
    @Body() body,
  ) {
    return this.cartService.updateItem(
      req.user.sub,
      id,
      body.quantity,
    );
  }

  @Delete('items/:id')
  removeItem(@Req() req, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.sub, id);
  }
}
