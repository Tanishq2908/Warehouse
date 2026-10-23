create or replace function update_stock(stockHistoryId integer,stock integer, amount NUMERIC, insQuantity integer,updateQuantity integer,packingSlipNo integer,materialId integer, userId VARCHAR)
	returns text as $$
	declare

	begin
		raise info 'Start of the function';
			--insert stock history
			INSERT into public.stock_history(
              stock_history_id, amount, created_at, created_by, packing_slip_no, quantity, updated_at, updated_by, stock)
             VALUES (stockHistoryId, amount, now(), userId, packingSlipNo, insQuantity, now(), userId, stock);

			--update stock
			UPDATE public.stock SET quantity= updateQuantity WHERE material = materialId;
			-- return success at the end
		return 'Success';
	end; $$
language plpgsql;