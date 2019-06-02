
const KEY = "blockex-search-history";

const add = term =>
{
  if (!term) return;

  let searches = getSet();
  searches.add(term);

  if (searches.size > 10)
  {
    let s = Array.from(searches);
    s = s.reverse().slice(0, 10).reverse();
    searches = s;
  }
   else
  {
    searches = Array.from(searches);
  }

  localStorage.setItem(KEY, JSON.stringify(searches));
  return searches;
};

const del = term =>
{
  if (!term) return;

  let searches = getSet();
  searches.delete(term);

  if (searches.size > 10)
  {
    let s = Array.from(searches);
    s = s.reverse().slice(0, 10).reverse();
    searches = s;
  }
  else
  {
    searches = Array.from(searches);
  }

  localStorage.setItem(KEY, JSON.stringify(searches));
  return searches;
};

const get = () =>
{
  try
  {
    const searches = localStorage.getItem(KEY);
    return !searches ? [] : JSON.parse(searches);
  }
  catch (err)
  {
    return [];
  }
};

const getSet = () => new Set(get());

module.exports = { add, del, get, getSet };
